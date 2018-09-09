var mongoose = require('mongoose');

module.exports = mongoose.model('Visit', {
    id: String,
    name: String,
    gender: String,
    dob: String,
    height: String,
    weight: String,
    allergies: String,
    history: String,
    medications: String
});