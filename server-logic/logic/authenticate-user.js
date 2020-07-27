const bcrypt = require('bcrypt')
const { models: { User } } = require('data')
const { validate } = require('utils')
const { sanitize } = require('../utils')

module.exports =  (email, password) => {
    validate.email(email)
    validate.string(password, 'password')

    return (async () => {
        const user = await User.findOne({ email })
        
        if(!user) throw new Error('Wrong credentials')

        if(!user.verifyed) throw new Error('Wrong credentials')

        if(!await bcrypt.compare(password, user.password)) throw new Error('Wrong credentials')

        return sanitize(user)
    })()
}