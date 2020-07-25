const { Schema, Types: { ObjectId } } = require('mongoose')

module.exports = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created: { type: Date, required: true, default: new Date }
})