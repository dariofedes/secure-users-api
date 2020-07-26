require('dotenv').config()
const { env: { JWT_VERIFICATION_SECRET, JWT_EXP } } = process
const nodemailer = require("nodemailer")
const jwt = require('jsonwebtoken')
const moment = require('moment')
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

module.exports = async function sendRegisterAlertEmail(userEmail, userId, verificationCode, date, ip, isVerifyed) {
    const verificationToken = jwt.sign({ sub: { id: userId, verificationCode } }, JWT_VERIFICATION_SECRET, { expiresIn: JWT_EXP })

    mailOptions = {
        from: 'Secure Users API',
        to: userEmail,
        subject: 'Security alert',
        text: `You May be under atack. Someone tryed to register an account using your already registered email from the IP ${ip.split(':')[ip.split(':').length - 1]} on ${moment(date).format('MM/DD/YYYY')} at ${moment(date).format('HH:mm')}. If it was you, ${isVerifyed ? 'and you forgot your password, try to recover your password' : `remember that you still have to activate your account with the following link: http://localhost:8080/verify/${verificationToken}`}. If it was not you, remain vigilant.`

    }

    await transporter.sendMail(mailOptions) 
}