const mongoose = require('mongoose')
const Schema = mongoose.Schema

const questionSchema = new Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId,
               ref: 'User',
               required: true
             },

    question: [],
    option: [],
    type: [],
    status: { type: String, default: 'active'},
}, { timeStamps: true})

module.exports = mongoose.model('Question', questionSchema)