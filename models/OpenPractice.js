var mongoose = require('mongoose');

var practiceSchema = new mongoose.Schema({
    date: String,
    attendance: { type: Number, default: 0, min: 0 }
});

module.exports = mongoose.model('OpenPractice', practiceSchema);