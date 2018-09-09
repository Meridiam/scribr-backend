var mongoose = require('mongoose');

module.exports = mongoose.model('Patient', {
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
