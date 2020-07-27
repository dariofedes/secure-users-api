require('dotenv').config()
const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { env: { DB_URL, PORT, JWT_VERIFICATION_SECRET } } = process
const { mongoose } = require('data')
const jwt = require('jsonwebtoken')
const { verifyUser } = require('server-logic')
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

    app.get('/verify/:verificationToken', (req, res) => {
        const { params: { verificationToken } } = req
        
        const { sub: { id, verificationCode } } = jwt.verify(verificationToken, JWT_VERIFICATION_SECRET)

        verifyUser(id, verificationCode)
            .then(() => res.status(200).end())
            .catch(({ message }) => {
                res
                    .status(400)
                    .json({
                        error: message
                    })
            })
    })
    
    app.listen(PORT, () => console.log(`Server up and listening in port ${PORT}`))

})()