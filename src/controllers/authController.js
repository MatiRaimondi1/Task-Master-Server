const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/mailer');

/**
 * Registers a new user
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = new User({
            name,
            email,
            password: await bcrypt.hash(password, 10),
            verificationCode
        });

        await newUser.save();

        await sendVerificationEmail(email, verificationCode);

        res.status(201).json({ message: "Verification code sent to email" });
    } catch (err) {
        res.status(500).json({ message: "Error registering user" });
        console.log(err);
    }
};

/**
 * Verifies a user's email address
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.verify = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.verificationCode !== code.toString()) {
            return res.status(400).json({ message: "Incorrect verification code" });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: "Error in server" });
    }
};

/**
 * Logs in a user
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        if (!user.isVerified) {
            return res.status(403).json({
                message: "PENDING_VERIFICATION",
                email: user.email
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).send("Error in the server");
    }
};

/**
 * Resends a verification code to a user's email
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.resendCode = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "This account is already verified" });
        }

        const newCode = Math.floor(100000 + Math.random() * 900000).toString();

        user.verificationCode = newCode;
        await user.save();

        await sendVerificationEmail(email, newCode);

        res.json({ message: "New verification code sent successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error resending verification code" });
    }
};