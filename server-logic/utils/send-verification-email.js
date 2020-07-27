require('dotenv').config()
const { env: { JWT_VERIFICATION_SECRET, JWT_EXP } } = process
const nodemailer = require("nodemailer")
const jwt = require('jsonwebtoken')
const { user, pass, host, port } = require('./mailer.config')
//This mailer.config file is ignored by git for security reasons. Remember to create your own and add it to you .gitignore file

const transporter = nodemailer.createTransport({
    host,
    port,
    auth: {
        user,
        pass
    }
})

module.exports = async function sendVerificationEmail(userEmail, userId, verificationCode) {
    const verificationToken = jwt.sign({ sub: { id: userId, verificationCode } }, JWT_VERIFICATION_SECRET, { expiresIn: JWT_EXP })

    mailOptions = {
        from: 'Secure Users API',
        to: userEmail,
        subject: 'Verify your email',
        text: `click here to verify your email -> http://localhost:8080/verify/${verificationToken}`

    }

    await transporter.sendMail(mailOptions) 
}