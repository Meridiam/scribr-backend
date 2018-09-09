var mongoose = require('mongoose');

module.exports = mongoose.model('Visit', {
    id: Number,
    audio_file: Blob,
    transcript: String,
    date: Date, //Turn into String if need be; or leave out entirely
    arrived_with: String,
    visit_reason: String,
    pain_loc: String,
    symptoms: String,
    diagnosis: String,
    treatment_plan: String
});