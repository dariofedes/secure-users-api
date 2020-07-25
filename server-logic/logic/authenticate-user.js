const { models: { User } } = require('data')
const { validate } = require('utils')

module.exports =  (email, password) => {
    validate.email(email)
    validate.string(password, 'password')

    return (async () => {
        const user = await User.findOne({ email, password })
        
        if(!user) throw new Error('wrong credentials')

        return user
    })()
}