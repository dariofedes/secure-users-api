require('dotenv').config()
const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { env: { DB_URL, PORT } } = process
const { mongoose } = require('data')
const schema = require('./gql/schema')
const cors = require('cors');


(async ()=> {
    await mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, () => console.log('Connected to Database'))
    
    const app = express()

    app.use(cors())

    app.use('/graphql', graphqlHTTP({
        schema,
        graphiql: true
    }))
    
    app.listen(PORT, () => console.log(`Server up and listening in port ${PORT}`))

})()