const { MailtrapClient } = require("mailtrap");

/**
 * Initializes the Mailtrap client
 */
const client = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

/**
 * Defines the sender information for the verification emails
 */
const sender = {
  email: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};

/**
 * Sends a verification email to a user
 * @param {*} email 
 * @param {*} code 
 */
const sendVerificationEmail = async (email, code) => {
    await client.send({
        from: sender,
        to: [{email}],
        subject: "Verify your account - TaskMaster Pro",
        html: `
            <div style="font-family: sans-serif; text-align: center;">
                <h2>¡Welcome to TaskMaster Pro!</h2>
                <p>Your verification code is:</p>
                <h1 style="color: #2563eb; letter-spacing: 5px;">${code}</h1>
                <p>This code will expire in 10 minutes.</p>
            </div>
        `
    });
};

module.exports = { sendVerificationEmail };