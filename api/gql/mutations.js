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
            type: UserType,
            args: {
                username: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString },
            },
            async resolve(parent, args) {
                const { username, email, password } = args

                const user = await registerUser(username, email, password)

                return user
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