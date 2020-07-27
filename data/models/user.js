const mongoose = require('mongoose')
const { user } = require('../schemas')

module.exports = mongoose.model('User', user)