const { models: { User } } = require('data')
const { validate } = require('utils')
const { sanitize } = require('../utils')

module.exports = (id, retrieverId) => {
    validate.string(id, 'id')
    validate.string(retrieverId, 'retrieverId')

    return (async () => {
        const retriever = await User.findById(retrieverId)
        if(!retriever) throw new Error(`User with id ${id} is not authorized to reach this point`)

        const user = await User.findById(id)
        if(!user || !user.verifyed) throw new Error(`User with id ${id} does not exist`)

        return sanitize(user)
    })()
}