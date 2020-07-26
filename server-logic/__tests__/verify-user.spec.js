require('dotenv').config()
const { env: { DB_URL_TEST, BCRYPT_SALT_ROUNDS } } = process
const bcrypt = require('bcrypt')
const { mongoose, models: { User } } = require('data')
const verifyUser = require('../logic/verify-user')
const { expect } = require('chai')

describe('verifyUser', () => {
    let user, verifyingUser

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
                const verificationCode = `verificationCode-${Math.floor(Math.random())}`
    
                user = new User({
                    email,
                    username,
                    password: await bcrypt.hash(password, parseInt(BCRYPT_SALT_ROUNDS)),
                    verificationCode
                })
    
                const { id } = await user.save()

                verifyingUser = {

                    id,
                    verificationCode
                }
            })
    
            it('should change the "verifyed" field of user from false to true', async () => {
                const unverifyedUser = await User.findById(verifyingUser.id)

                expect(unverifyedUser.verifyed).to.be.false
    
                await verifyUser(verifyingUser.id, verifyingUser.verificationCode)

                const verifyedUser = await User.findById(verifyingUser.id)

                expect(verifyedUser.verifyed).to.be.true
            })

            it('should remove the verification code from the database', async () => {
                const unverifyedUser = await User.findById(verifyingUser.id)

                expect(unverifyedUser.verificationCode).to.exist
    
                await verifyUser(verifyingUser.id, verifyingUser.verificationCode)

                const verifyedUser = await User.findById(verifyingUser.id)

                expect(verifyedUser.verificationCode).not.to.exist
            })

            it('should return the verifyed user', async () => {
                const unverifyedUser = await User.findById(verifyingUser.id)
    
                const verifyedUser = await verifyUser(verifyingUser.id, verifyingUser.verificationCode)

                expect(verifyedUser.id).to.equal(unverifyedUser.id)
                expect(verifyedUser.email).to.equal(unverifyedUser.email)
                expect(verifyedUser.username).to.equal(unverifyedUser.username)
            })
         })

         describe('on wrong fields', async () => {
            beforeEach(async () => {
                const email = `email-${Math.random()}@email.com`
                const username =  `username-${Math.random()}`
                const password =  `password-${Math.random()}`
                const verificationCode = `verificationCode-${Math.floor(Math.random())}`
    
                user = new User({
                    email,
                    username,
                    password: await bcrypt.hash(password, parseInt(BCRYPT_SALT_ROUNDS)),
                    verificationCode: await bcrypt.hash(verificationCode, parseInt(BCRYPT_SALT_ROUNDS))
                })
    
                const { id } = await user.save()

                verifyingUser = {

                    id,
                    verificationCode
                }
            })
    
            it('should fail on non existing user id', async () => {
                let _error

                await User.findByIdAndDelete(verifyingUser.id)

                try{
                    await verifyUser(verifyingUser.id, verifyingUser.verificationCode)
                } catch(error) {
                    _error = error

                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal(`User with id ${verifyingUser.id} does not exist`)
                }

                expect(_error).to.exist
            })

            it('should fail on not matching verification code', async () => {
                let _error

                try{
                    await verifyUser(verifyingUser.id, `wrong-${verifyingUser.verificationCode}`)
                } catch(error) {
                    _error = error

                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal('Wrong verification code')
                }

                expect(_error).to.exist
            })
         })
    })


    describe('on verifyed user', () => {
        beforeEach(async () => {
            const email = `email-${Math.random()}@email.com`
            const username =  `username-${Math.random()}`
            const password =  `password-${Math.random()}`
            const verificationCode = `verificationCode-${Math.floor(Math.random())}`

            user = new User({
                email,
                username,
                password: await bcrypt.hash(password, parseInt(BCRYPT_SALT_ROUNDS)),
                verifyed: true
            })

            const { id } = await user.save()

            verifyingUser = {
                id,
                verificationCode
            }
        })

        it('should fail', async () => {
            let _error

            try{
                await verifyUser(verifyingUser.id, verifyingUser.verificationCode)
            } catch(error) {
                _error = error

                expect(error).to.be.an.instanceof(Error)
                expect(error.message).to.equal('User already verifyed')
            }

            expect(_error).to.exist
        })
    
    })

    after(async () => {
        await User.deleteMany()
        await mongoose.disconnect()
    })
})

