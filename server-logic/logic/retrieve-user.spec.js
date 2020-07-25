require('dotenv').config()
const { env: { DB_URL_TEST } } = process
const { mongoose, models: { User } } = require('data')
const retrieveUser = require('./retrieve-user')
const { expect } = require('chai')

describe('retrieveUser', () => {
    let user, id

    before(async () => {
        await mongoose.connect(DB_URL_TEST, { useNewUrlParser: true, useUnifiedTopology: true })
        await User.deleteMany()
    })

    describe('on valid fields', () => {
        beforeEach(async () => {
            user = new User({
                email: `email-${Math.random()}@email.com`,
                username: `username-${Math.random()}`,
                password: `password-${Math.random()}`,
            })

             const _user = await user.save()

             id = _user._id.toString()
        })

        it('should return the user\'s info', async () => {
            const retrievedUser = await retrieveUser(id)

            expect(retrievedUser.email).to.equal(user.email)
            expect(retrievedUser.username).to.equal(user.username)
        })
    })
    
    describe('on wrong fields', () => {
        beforeEach(async () => {
            user = new User({
                email: `email-${Math.random()}@email.com`,
                username: `username-${Math.random()}`,
                password: `password-${Math.random()}`,
            })

             const _user = await user.save()

             id = _user._id.toString()
        })

        it('should fail on non existing user', async () => {
            let _error

            await User.findOneAndRemove({ _id: id })

            try {
                await retrieveUser(id)
            } catch(error) {
                _error = error

                expect(error).to.be.an.instanceof(Error)
                expect(error.message).to.equal(`user with id ${id} does not exist`)
            }

            expect(_error).to.exist
        })

        it('should fail on non string id', async () => {
            id = true
            let _error

            try {
                await retrieveUser(id)
            } catch(error) {
                _error = error

                expect(error).to.be.an.instanceof(Error)
                expect(error.message).to.equal(`id true is not a string`)
            }

            expect(_error).to.exist
        })
    })

    after(async () => {
        await User.deleteMany()
        await mongoose.disconnect()
    })
})

