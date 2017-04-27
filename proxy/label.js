'use strict';
const Label = require('../models').Label;
// 添加新的标签
exports.newAndSave = function(obj) {
  let newLabel = new Label();
  Object.assign(newLabel, obj);
  return newLabel.save();
}


exports.getAllLabels = function() {
  return Label.find().exec();
}


exports.getLabelByName = function(labelName) {
  return Label.find({labelName: labelName}).exec();
}

exports.removeLabelById = function(id) {
  return Label.findOneAndRemove({_id: id}).exec();
}