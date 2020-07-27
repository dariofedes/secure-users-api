const { expect } = require('chai')
const { validate } = require('./index')

describe('validate', () => {
    describe('.string', () => {
        it('should not throw on string target',  () => {
            const name = 'name'
            const target = 'target'
    
            expect(() => validate.string(target, name)).not.to.throw()
        })

        it('should throw on non-string target', () => {
            const name = 'name'

            let target = 1
            expect(() => validate.string(target, name)).to.throw(TypeError, 'name 1 is not a string')

            target = true
            expect(() => validate.string(target, name)).to.throw(TypeError, 'name true is not a string')

            target = [1, 2, 3]
            expect(() => validate.string(target, name)).to.throw(TypeError, 'name 1,2,3 is not a string')
        })

        it('should throw on empty string by default', () => {
            const target = ''
            const name = 'name'

            expect(() => validate.string(target, name)).to.throw(Error, 'name is empty')
        })

        it('should not throw on empty string with empty flag to false', () => {
            const target = ''
            const name = 'name'

            expect(() => validate.string(target, name, false)).not.to.throw()
        })
    })

    describe('.email', () => {
        it('should not fail on valid email target', () => {
            const target = 'valid@email.com'

            expect(() => validate.email(target)).not.to.throw()
        })

        it('should fail on non-vaild email target', () => {
            const target = 'notvalidemail'

            expect(() => validate.email(target)).to.throw(Error, 'notvalidemail is not an email')
        })

        it('should fail on non-string target', () => {
            let target = 1
            expect(() => validate.email(target)).to.throw(Error, '1 is not an email')
            
            target = true
            expect(() => validate.email(target)).to.throw(Error, 'true is not an email')
            
            target = {}
            expect(() => validate.email(target)).to.throw(Error, `${target} is not an email`)
        })
        
        it('should fail on empty target', () => {
            target = ''

            expect(() => validate.email(target)).to.throw(Error, `${target} is not an email`)
        })
    })
})