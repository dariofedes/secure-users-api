const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString
} = require('graphql')

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        created: { type: GraphQLString }
    })
})

const LoginType = new GraphQLObjectType({
    name: 'Login',
    fields: () => ({
        user: { type: UserType },
        token: { type: GraphQLString }
    })
})

module.exports = {
    UserType,
    LoginType
}