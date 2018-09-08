var mongoose = require('mongoose');

var rosterSchema = new mongoose.Schema({
    id: String,
    roster: [String]
});

module.exports = mongoose.model('Roster', rosterSchema);