var mongoose = require('mongoose');

module.exports = mongoose.model('Visit', {
    id: String,
    patient_id: String,
    audio_file: String,
    transcript: String,
    date: String,
    arrived_with: String,
    visit_reason: String,
    pain_loc: String,
    symptoms: String,
    diagnosis: String,
    treatment_plan: String
});
