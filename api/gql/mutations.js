require('dotenv').config()
const { env: { JWT_SECRET, JWT_EXP } } = process
const {
    GraphQLObjectType,
    GraphQLString
} = require('graphql')
const jwt = require('jsonwebtoken')
const {
    UserType,
    LoginType
} = require('./types')
const { registerUser, authenticateUser } = require('server-logic')

module.exports = new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
        registerUser: {
            type: GraphQLString,
            args: {
                username: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString },
            },
            async resolve(parent, args, context) {
                const { username, email, password } = args

                await registerUser(username, email, password, context.ip)


                // This endpoint always retruns the same feedback to the client

                return 'Check your email, we sent you an activation link.'
            }
        },
        authenticateUser: {
            type: LoginType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const { email, password } = args
                const user = await authenticateUser(email, password)

                const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXP })
                
                return {
                    user,
                    token
                }
            }
        }
    }
})