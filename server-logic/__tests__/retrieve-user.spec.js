require('dotenv').config()
const { env: { DB_URL_TEST } } = process
const { mongoose, models: { User } } = require('data')
const retrieveUser = require('../logic/retrieve-user')
const { expect } = require('chai')

describe('retrieveUser', () => {
    let user, id, retrieverId

    before(async () => {
        await mongoose.connect(DB_URL_TEST, { useNewUrlParser: true, useUnifiedTopology: true })
        await User.deleteMany()
    })

    describe('on non verifyed user requested', () => {
        describe('on valid fields', () => {
            beforeEach(async () => {
                user = new User({
                    email: `email-${Math.random()}@email.com`,
                    username: `username-${Math.random()}`,
                    password: `password-${Math.random()}`,
                })
    
                const _user = await user.save()
    
                id = _user._id.toString()

                retriever = new User({
                    email: `email-${Math.random()}@email.com`,
                    username: `username-${Math.random()}`,
                    password: `password-${Math.random()}`,
                })
    
                 const _retriever = await retriever.save()
    
                 retrieverId = _retriever._id.toString()
            })
    
            it('should fail', async () => {
                let _error
    
                try {
                    await retrieveUser(id, retrieverId)
                } catch(error) {
                    _error = error
    
                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal(`User with id ${id} does not exist`)
                }
    
                expect(_error).to.exist
            })

            it('should not give feedback about whether the user is registered or not', async () => {
                let _error
    
                try{
                    await retrieveUser(id, retrieverId)
                } catch(error) {
                    _error = error
                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal(`User with id ${id} does not exist`)
                }
    
                expect(_error).to.exist
            })

            it('should fail on non existing retriever user and dont give feedback about the requested user', async () => {
                let _error
    
                await User.findByIdAndDelete(retrieverId)

                try{
                    await retrieveUser(id, retrieverId)
                } catch(error) {
                    _error = error
                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal(`User with id ${id} is not authorized to reach this point`)
                }
    
                expect(_error).to.exist
            })
        })
    })

    describe('on verifyed user requested', () => {
        describe('on valid fields', () => {
            beforeEach(async () => {
                user = new User({
                    email: `email-${Math.random()}@email.com`,
                    username: `username-${Math.random()}`,
                    password: `password-${Math.random()}`,
                    verifyed: true
                })
    
                const _user = await user.save()
    
                id = _user._id.toString()

                retriever = new User({
                    email: `email-${Math.random()}@email.com`,
                    username: `username-${Math.random()}`,
                    password: `password-${Math.random()}`,
                })
    
                const _retriever = await retriever.save()
    
                retrieverId = _retriever._id.toString()
            })
    
            it('should return the user\'s info', async () => {
                const retrievedUser = await retrieveUser(id, retrieverId)
    
                expect(retrievedUser.email).to.equal(user.email)
                expect(retrievedUser.username).to.equal(user.username)
            })
    
            it('should not return the users\' password', async () => {
                const retrievedUser = await retrieveUser(id, retrieverId)
    
                expect(retrievedUser.password).not.to.exist
            })
    
            it('should not expose the database', async () => {
                const retrievedUser = await retrieveUser(id, retrieverId)
    
                expect(retrievedUser._id).not.to.exist
                expect(retrievedUser._doc).not.to.exist
                expect(retrievedUser.__v).not.to.exist
            })

            it('should fail on non existing retriever user and dont give feedback about the requested user', async () => {
                let _error
    
                await User.findByIdAndDelete(retrieverId)

                try{
                    await retrieveUser(id, retrieverId)
                } catch(error) {
                    _error = error
                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal(`User with id ${id} is not authorized to reach this point`)
                }
    
                expect(_error).to.exist
            })
        })
        
        describe('on wrong fields', () => {
            beforeEach(async () => {
                user = new User({
                    email: `email-${Math.random()}@email.com`,
                    username: `username-${Math.random()}`,
                    password: `password-${Math.random()}`,
                    verifyed: true
                })
    
                const _user = await user.save()
    
                id = _user._id.toString()

                retriever = new User({
                    email: `email-${Math.random()}@email.com`,
                    username: `username-${Math.random()}`,
                    password: `password-${Math.random()}`,
                })
    
                const _retriever = await retriever.save()
    
                retrieverId = _retriever._id.toString()
            })
    
            it('should fail on non existing user', async () => {
                let _error
    
                await User.findByIdAndDelete(id)
    
                try {
                    await retrieveUser(id, retrieverId)
                } catch(error) {
                    _error = error
    
                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal(`User with id ${id} does not exist`)
                }
    
                expect(_error).to.exist
            })
    
            it('should fail on non string id', async () => {
                id = true
                let _error
    
                try {
                    await retrieveUser(id, retrieverId)
                } catch(error) {
                    _error = error
    
                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal(`id true is not a string`)
                }
    
                expect(_error).to.exist
            })
        })
    })

    after(async () => {
        await User.deleteMany()
        await mongoose.disconnect()
    })
})

