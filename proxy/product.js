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

exports.deleteProductById = function(productId, obj) {
  return Product.findOneAndUpdate({productId: productId}, {
    $set: {
      status: false,
      labelName: 'deleted'
    }
  }, {
    overwrite: true
  }).exec();
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
exports.updateProductStocks = function(productId, newStocks, updateTime) {
  return Product.findOneAndUpdate({productId: productId}, {
    $set: {
      stocks: newStocks,
      updateTime: updateTime
    }
  }).exec();
}

// 更新商品设置信息

exports.updateProductSetting = function(productId, updateInfos) {
  return Product.findOneAndUpdate({productId: productId}, {
    $set: {
      colours : updateInfos.colours,
      // threshold : updateInfos.threshold,
      nickname : updateInfos.nickname,
      status : updateInfos.status,
      labelName: updateInfos.labelName
    }
  }, {
    overwrite: true
  }).exec();
}

exports.getProductByProductId = function(productId) {
  return Product.findOne({ productId: productId }).exec();
}

exports.getAllProducts = function(query) {
  return Product.find(query).exec();
}

/**
 *  getProducts 根据更新时间排序，
 *  然后从第 skip 开始取 limit 个 mail
 *  @param { Number }  page 第几页
 *  @param { Number }  limit 每页的数量
 *  @param { Object }  查询条件，如 status
 *  @param { Function } 回调函数
 *  - err
 *  - commodities { Array }
 */
exports.getProducts = function(page, per_page, query) {
  let skip = (page-1) * per_page;
  return Product.find(query)
    .sort({
      updateTime: -1
    })
    .skip(skip)
    .limit(per_page)
    .exec();
}

exports.getProductsCount = function(query) {
  return Product.count(query).exec();
}