require('dotenv').config()
const { env: { DB_URL_TEST, BCRYPT_SALT_ROUNDS } } = process
const bcrypt = require('bcrypt')
const { mongoose, models: { User } } = require('data')
const authenticateUser = require('../logic/authenticate-user')
const { expect } = require('chai')

describe('authenticateUser', () => {
    let user, authUser

    before(async () => {
        await mongoose.connect(DB_URL_TEST, { useNewUrlParser: true, useUnifiedTopology: true })
        await User.deleteMany()
    })

    describe('on non verifyed user', () => {
        describe('on valid fields', async () => {
            beforeEach(async () => {
                const email = `email-${Math.random()}@email.com`
                const username =  `username-${Math.random()}`
                const password =  `password-${Math.random()}`
    
                user = new User({
                    email,
                    username,
                    password: await bcrypt.hash(password, parseInt(BCRYPT_SALT_ROUNDS))
                })
    
                
                authUser = {
                    email,
                    password
                }
    
                await user.save()
            })
    
            it('should fail', async () => {
                let _error
    
                try{
                    await authenticateUser(authUser.email, authUser.password)
                } catch(error) {
                    _error = error
                    expect(error).to.be.an.instanceof(Error)
                }
    
                expect(_error).to.exist
            })

            it('should not give feedback about whether the user is registered or not', async () => {
                let _error
    
                try{
                    await authenticateUser(authUser.email, authUser.password)
                } catch(error) {
                    _error = error
                    expect(error.message).to.equal('Wrong credentials')
                    
                }
    
                expect(_error).to.exist
            })
         })
    })


    describe('on verifyed user', () => {
        describe('on valid fields', async () => {
            beforeEach(async () => {
                const email = `email-${Math.random()}@email.com`
                const username =  `username-${Math.random()}`
                const password =  `password-${Math.random()}`
    
                user = new User({
                    email,
                    username,
                    password: await bcrypt.hash(password, parseInt(BCRYPT_SALT_ROUNDS)),
                    verifyed: true
                })
    
                
                authUser = {
                    email,
                    password
                }
    
                await user.save()
            })
    
            it('should work fine with encrypted passwords from the database', async () => {
                let _error
    
                try{
                    await authenticateUser(authUser.email, authUser.password)
                } catch(error) {
                    _error = error
                    expect(error.message).to.equal('Wrong credentials')

                }
    
                expect(_error).not.to.exist
            })
    
            it('should return the user on success', async () => {
                const registeredUser = await User.findOne({ email: user.email })
                const { id } = await authenticateUser(authUser.email, authUser.password)
    
                expect(id).to.equal(registeredUser.id)
            })
    
            it('should not expose the database', async () => {
                const user = await authenticateUser(authUser.email, authUser.password)
    
                expect(user.__v).not.to.exist
                expect(user._id).not.to.exist
                expect(user._doc).not.to.exist
            })
    
            it('should fail on wrong password and valid email', async () => {
                let _error

                authUser.password = `wrong${authUser.password}`
    
                try {
                    await authenticateUser(authUser.email, authUser.password)
                } catch(error) {
                    _error = error

                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal('Wrong credentials')
                }

                expect(_error).to.exist
            })
    
            it('should fail on non existing email', async () => {
                let _error

                authUser.email = `wrong${authUser.email}`
    
                try {
                    await authenticateUser(authUser.email, authUser.password)
                } catch(error) {
                    _error = error

                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal('Wrong credentials')
                }

                expect(_error).to.exist
            })
         })
    
        describe('on wrong fields', async () => {
            beforeEach(() => {
                user = new User({
                    email: `email-${Math.random()}@email.com`,
                    username: `username-${Math.random()}`,
                    password: `password-${Math.random()}`,
                    verifyed: false
                })
    
                user.save()
    
                authUser = {
                    email: user.email,
                    password: user.password
                }
            })
    
            it('should fail on non string password', async () => {
                authUser.password = true
    
                try {
                    await authenticateUser(authUser.email, authUser.password)
                } catch(error) {
                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal('password true is not a string')
                }
            })
    
            it('should fail on non string email', async () => {
                authUser.email = true
    
                try {
                    await authenticateUser(authUser.email, authUser.password)
                } catch(error) {
                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal('true is not an email')
                }
            })
    
            it('should fail on non valid email pattern', async () => {
                authUser.email = `nonValidEmail`
    
                try {
                    await authenticateUser(authUser.email, authUser.password)
                } catch(error) {
                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal('nonValidEmail is not an email')
                }
            })
        })
    })

    after(async () => {
        await User.deleteMany()
        await mongoose.disconnect()
    })
})

