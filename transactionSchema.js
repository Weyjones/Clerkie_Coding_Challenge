const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    name: String,
    date: Date,
    amount: Number,
    trans_id: Number,
    user_id: Number,
    is_recurring: Boolean
});

module.exports = mongoose.model('Transaction', transactionSchema);