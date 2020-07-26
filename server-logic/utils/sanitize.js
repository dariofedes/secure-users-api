module.exports = function(document) {
    document = document.toObject && document.toObject() || document
    document.id = document._id.toString()
    typeof document._id !== 'undefined' && delete document._id
    typeof document.__v !== 'undefined' && delete document.__v
    typeof document.password !== 'undefined' && delete document.password
    typeof document.verificationCode !== 'undefined' && delete document.verificationCode
    typeof document.verifyed !== 'undefined' && delete document.verifyed
    
    return document
}