require('dotenv').config()
const {
    GraphQLObjectType,
    GraphQLID
} = require('graphql')
const { UserType } = require('./types')
const { retrieveUser } = require('server-logic')
const jwt = require('jsonwebtoken')
const { env: { JWT_SECRET } } = process

module.exports = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            async resolve(parent, args, context) {
                const { headers: { authorization } } = context
                const [ , token] = authorization.split(' ')
                const { sub: retrieverId } = await jwt.verify(token, JWT_SECRET)

                return await retrieveUser(args.id, retrieverId)
            }
        }
    }
})