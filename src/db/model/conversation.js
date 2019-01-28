const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    label: {type: String, required: true}
});

module.exports = mongoose.model('conversation', schema);
