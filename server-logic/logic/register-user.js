const { models: { User } } = require('data')
const { validate } = require('utils')

module.exports = (username, email, password) => {
    validate.string(username, 'username')
    validate.email(email)
    validate.string(password, 'password')

    return (async () => {
        // Preventing duplicated accounts
        let user = await User.findOne({ email })
        if(user) throw new Error (`email ${email} is already in use`)

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


        user = new User({
            email,
            username,
            password
        })
        
        return await user.save()
    })()
}