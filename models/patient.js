var mongoose = require('mongoose');

module.exports = mongoose.model('Visit', {
    id: Number,
    name: String,
    gender: String,
    DOB: String,
    height: Number,
    weight: Number,
    allergies: String,
    history: String,
    medications: String
});