require('dotenv').config()
const { env: { BCRYPT_SALT_ROUNDS } } = process
const bcrypt = require('bcrypt')
const { models: { User } } = require('data')
const { validate } = require('utils')
const { sanitize } = require('../utils')
const { sendVerificationEmail } = require('../utils')

module.exports = (username, email, password) => {
    validate.string(username, 'username')
    validate.email(email)
    validate.string(password, 'password')

    return (async () => {
        // Preventing duplicated accounts
        let user = await User.findOne({ email })
        if(user) {
            if(!user.verifyed) await sendVerificationEmail(email, user.id, user.verificationCode)

            throw new Error (`Email ${email} is already in use. Please login or check your email and verify your account`)
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