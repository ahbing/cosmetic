'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const LabelSchema = new Schema({
  labelName: { type: String, index: true }
}, { autoIndex: false });

const Label = mongoose.model('Label', LabelSchema);

module.exports = Label;
