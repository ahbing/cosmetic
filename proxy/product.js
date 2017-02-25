'use strict';
const Product = require('../models').Product;

// 关注新的产品
exports.newAndSave = function(obj) {
  let newProduct = new Product();
  Object.assign(newProduct, obj);
  return newProduct.save();
}

// 取消关注产品
exports.removeProductById = function(productId, obj) {
  return Product.findOneAndRemove({productId: productId}).exec();
}

// 更新产品最后更新时间
exports.updateProductTime = function(id) {
  return Product.findOneAndUpdate(id, {
    $set: {
      updateTime: Date.now()
    }
  }).exec();
}

// 更新产品库存信息
/**
 * @param newStocks []
 */
exports.updateProductStocks = function(productId, newStocks) {
  return Product.findOneAndUpdate({productId: productId}, {
    $set: {
      stocks: newStocks
    }
  }).exec();
}

exports.getProductByProductId = function(productId) {
  return Product.findOne({ productId: productId }).exec();
}

exports.getAllProducts = function() {
  return Product.find().exec();
}