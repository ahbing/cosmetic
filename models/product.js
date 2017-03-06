'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const ProductSchema = new Schema({
  productId: { type: String },
  storeId: { type: String },
  status: { type: Boolean, default: true }, // 是否关注
  updateTime: { type: Date, default: Date.now }, // 更新时间
  productBrand: { type: String },
  productTitle: { type: String },
  wcid: { type: String }, //再组装 stocks 中的 value => url ?previewAttribute=Spanish+pink
  stocks: [{}],
  colours: { type: Array, default: [] },
  nickname: { type: String, default: '' },
  threshold: { type: Number, default: 10 } // 从无到有超过多少值才通知
}, { autoIndex: false });

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
