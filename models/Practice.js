var mongoose = require('mongoose');

var practiceSchema = new mongoose.Schema({
    date: String,
    registered: [String]
});

module.exports = mongoose.model('Practice', practiceSchema);