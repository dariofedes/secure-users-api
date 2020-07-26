require('dotenv').config()
const { env: { BCRYPT_SALT_ROUNDS } } = process
const bcrypt = require('bcrypt')
const { models: { User } } = require('data')
const { validate } = require('utils')
const { sanitize } = require('../utils')
const { sendVerificationEmail, sendRegisterAlertEmail } = require('../utils')

module.exports = (username, email, password, requesterIp) => {
    validate.string(username, 'username')
    validate.email(email)
    validate.string(password, 'password')

    return (async () => {
        // Preventing duplicated accounts
        let user = await User.findOne({ email })
        if(user) {
            await sendRegisterAlertEmail(email, user.id, user.verificationCode, new Date(), requesterIp, user.verifyed)

            return
        }

        // Preventing repeated usernames
        let usernameCounter = 1

        do {
            user = await User.findOne({ username })

            if(user) {
                if(usernameCounter > 1) {
                    username = `${username.slice(0, -1)}${usernameCounter}`
                } else {
                    username = `${username}${usernameCounter}`
                }

                usernameCounter++
            }
        } while(user)

        const verificationCode = Math.floor(Math.random() * 100000).toString()

        user = new User({
            email,
            username,
            password: await bcrypt.hash(password, parseInt(BCRYPT_SALT_ROUNDS)),
            verificationCode
        })
        
        const registeredUser = await user.save()
        
        await sendVerificationEmail(email, registeredUser.id, verificationCode)

        return sanitize(registeredUser)
    })()
}