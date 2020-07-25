const { models: { User } } = require('data')
const { validate } = require('utils')

module.exports = (id) => {
    validate.string(id, 'id')

    return (async () => {
        let user = await User.findById(id)
        if(!user)throw new Error(`user with id ${id} does not exist`)

        return user
    })()
}