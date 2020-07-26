const { models: { User } } = require('data')
const { validate } = require('utils')
const { sanitize } = require('../utils')

module.exports = (userId, verificationCode) => {
    validate.string(userId, 'userId')
    validate.string(verificationCode, 'verificationCode')

    return (async () => {
        const user = await User.findById(userId)
        if(!user) throw new Error(`User with id ${userId} does not exist`)

        if(user.verifyed) throw new Error('User already verifyed')

        if(verificationCode !== user.verificationCode) throw new Error('Wrong verification code')

        user.verifyed = true
    
        user.verificationCode = undefined

        return sanitize(await user.save())
    })()
}