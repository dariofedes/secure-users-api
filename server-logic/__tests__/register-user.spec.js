require('dotenv').config()
const { env: { DB_URL_TEST } } = process
const bcrypt = require('bcrypt')
const { expect } = require('chai')
const { mongoose, models: { User } } = require('data')
const registerUser = require('../logic/register-user')

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

            it('should not fail on existing username', async () => {
                let _error
                email = `new-${email}`
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

            it('should change the username on existing username', async () => {
                await User.create({username, email, password})

                const firstSameUsername = await registerUser(username, `firstDifferent-${email}`, password)

                expect(firstSameUsername.username).not.to.equal(username)
                expect(firstSameUsername.username.length).to.equal(username.length + 1)

                const secondSameUsername = await registerUser(username, `secondDifferent-${email}`, password)

                expect(secondSameUsername.username).not.to.equal(username)
                expect(secondSameUsername.username).not.to.equal(firstSameUsername.username)
                expect(secondSameUsername.username.length).to.equal(username.length + 1)
                expect(secondSameUsername.username.length).to.equal(firstSameUsername.username.length)
            })

            it('should encrypt the password', async () => {
                const registeredUser = await registerUser(username, email, password)

                const { password: encryptedPassword } = await User.findById(registeredUser.id)

                expect(encryptedPassword).not.to.equal(password)

                let _error

                try {
                    const successfullyEncryptedPassword = await bcrypt.compare(password, encryptedPassword)

                    expect(successfullyEncryptedPassword).to.be.true
                } catch(error) {
                    _error = error
                }

                expect(_error).not.to.exist
                
            })

            it('should create the user as not verifyed by default', async () => {
                const { id } = await registerUser(username, email, password)

                const registeredUser = await User.findById(id)
    
                expect(registeredUser.verifyed).to.be.false
            })

            it('should create the user with a verification code', async () => {
                const { id } = await registerUser(username, email, password)

                const registeredUser = await User.findById(id)
    
                expect(registeredUser.verificationCode).to.exist
                expect(registeredUser.verificationCode).to.be.a('string')
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
    
    
            it('should not fail on existing email', async () => {
                let _error
                try {
                    
                        await registerUser(username, email, password, 'fake:ip')
                    
        
                } catch(error) {
                    _error = error
                }

                expect(_error).not.to.exist
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

