require('dotenv').config()
const { env: { DB_URL_TEST } } = process
const { mongoose, models: { User } } = require('data')
const registerUser = require('./register-user')
const { expect } = require('chai')

describe('registerUser', () => {
    let email, username, password

    before(async () => {
        await mongoose.connect(DB_URL_TEST, { useNewUrlParser: true, useUnifiedTopology: true })
        await User.deleteMany()
    })

    describe('on valid fields', () => {
        describe('on new user', async () => {
            beforeEach(() => {
                email = `email-${Math.random()}@email.com`
                username =  `username-${Math.random()}`
                password =  `password-${Math.random()}`
            })
    
            it('should succeed on valid fields', async () => {
                let _error
    
                try {
                    await registerUser(username, email, password)
                } catch(error) {
                    _error = error
                }
    
                expect(_error).not.to.exist
            })
    
            it('should not expose the database', async () => {
                const user = await registerUser(username, email, password)
                expect(user.__v).not.to.exist
                expect(user._id).not.to.exist
                expect(user._doc).not.to.exist
            })
    
    
            it('should save the right user data', async () => {
                const registeredUser = await registerUser(username, email, password)
    
                expect(registeredUser.email).to.equal(email)
                expect(registeredUser.username).to.equal(username)
            })        
        })
    
        describe('on existing user', () => {
            beforeEach(async () => {
                username = `username-${Math.random()}`
                email = `email-${Math.random()}@email.com`
                password = `password-${Math.random()}`
    
                const user = await new User({ username, email, password })
    
                await user.save()
            })
    
            it('should fail on existing username', async () => {
                email = `new-${email}`
                try {
                        await registerUser(username, email, password)
        
                } catch(error) {
                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal(`username ${username} is already in use`)
                }
            })
    
            it('should fail on existing email', async () => {
                username = `new-${username}`
                try {
                    
                        await registerUser(username, email, password)
                    
        
                } catch(error) {
                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal(`email ${email} is already in use`)
                }
            })
        })
    })

    describe('on non valid fields', () => {
        beforeEach(() => {
            email = `email-${Math.random()}@email.com`
            username =  `username-${Math.random()}`
            password =  `password-${Math.random()}`
        })

        it('should fail on non string password', async () => {
            password = true

            try {
                await registerUser(username, email, password)
            } catch(error) {
                expect(error).to.be.an.instanceof(Error)
                expect(error.message).to.equal('password true is not a string')
            }
        })

        it('should fail on non string username', async () => {
            username = true

            try {
                await registerUser(username, email, password)
            } catch(error) {
                expect(error).to.be.an.instanceof(Error)
                expect(error.message).to.equal('username true is not a string')
            }
        })

        it('should fail on non string email', async () => {
            email = true

            try {
                await registerUser(username, email, email)
            } catch(error) {
                expect(error).to.be.an.instanceof(Error)
                expect(error.message).to.equal('true is not an email')
            }
        })

        it('should fail on non valid email pattern', async () => {
            email = 'notValidEmail'

            try {
                await registerUser(username, email, password)
            } catch(error) {
                expect(error).to.be.an.instanceof(Error)
                expect(error.message).to.equal('notValidEmail is not an email')
            }
        })
    })
    

    after(async () => {
        await User.deleteMany()
        await mongoose.disconnect()
    })
})

