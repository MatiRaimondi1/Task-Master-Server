const jwt = require('jsonwebtoken');

/**
 * Authenticates a user based on a JWT token
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
module.exports = function (req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1] || req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, access denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Invalid token' });
    }
};