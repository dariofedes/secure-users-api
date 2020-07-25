const bcrypt = require('bcrypt')
const { models: { User } } = require('data')
const { validate } = require('utils')
const { sanitize } = require('../utils')

module.exports =  (email, password) => {
    validate.email(email)
    validate.string(password, 'password')

    return (async () => {
        const user = await User.findOne({ email })
        
        if(!user) throw new Error('wrong credentials')

        if(!(await bcrypt.compare(password, user.password))) throw new Error('wrong credentials')

        return sanitize(user)
    })()
}