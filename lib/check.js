#!/usr/bin/env node

const mapLimit = require("async/mapLimit");
const productProxy = require('../proxy/product');
const sendMail = require('./email').sendEmail;
const getRemoteData = require('./remote').getRemoteData;
const config = require('../config');
let count = 0;
checkProduct();
function checkProduct() {
  const per = 5 * 60 * 1000;  // 5min
  console.log('查询次数', ++count);
  // const per = 10 * 60;  // 
  let startTime = Date.now();
  productProxy.getAllProducts().then(function(products) {
    mapLimit(products, 5, function(product, callback) {
      comparedAndUpdate(product, callback);
    }, function(err, results) {
      if (err) return console.error(err);
      let stopTime = Date.now();
      let spentTime = stopTime - startTime;
      let nextPerTime = per - spentTime;
      console.log(nextPerTime, '毫秒之后再次查询'); 
      if (nextPerTime < 0) {
        checkProduct(); // 立刻执行
      } else {
        let timer = setTimeout(function() {
          clearTimeout(timer);
          checkProduct()
        }, nextPerTime);
      }
    });
  }).catch(function(err) {
    console.log(err);
  });
}

/**
 * 本地数据库的数据与远程数据对比
 * 如果有数据从无到有便通知
 */
function comparedAndUpdate(product, callback) {
  const url = `http://www.selfridges.com/HK/en/webapp/wcs/stores/servlet/AjaxStockStatusView?productId=${product.productId}&storeId=${product.storeId}`;
  getRemoteData(url, function(json) {
    const newData = json.stocks; // arr
    const oldData = product.stocks;
    // 更新数据库数据
    productProxy.updateProductStocks(product.productId, newData).then(function(newProduct) {
      const outOfStock = [];
      for(let i = 0, len = oldData.length; i < len; i++) {
        if (!oldData[i].inStock) {
          outOfStock.push({
            index: i,
            oldItemData: oldData[i]
          });
        }
      }
      if(outOfStock.length) {
        outOfStock.forEach(function(item) {
          let index = item['index'];
          let oldItemData = item['oldItemData'];
          let newItemData = newData[index];
          if (newItemData.sku === oldItemData.sku && newItemData.inStock && !oldItemData.inStock) {
            // 组装通知内容
            let title = product.productTitle.split(' ').join('-');
            let brand = product.productBrand.split(' ').join('-');
            let value = newItemData.value.split(' ').join('+');
            let link = `http://www.selfridges.com/HK/en/cat/${title}-${brand}_${product.wcid}/?previewAttribute=${value}`;
            let mailTo = config.mailto.success;
            let fields = {
              subject: '商品库存更新提醒',
              to: mailTo,
              html: `
              <p>你关注的商品${title}的${newItemData.value}款，由无货变成了有货，点击下面链接购买</p>
              <a href="${link}">购买链接</a>
              <p>如果链接无效，请复制一下链接到浏览器</p>
              <p>${link}<p>
              <p>如果不再关注该商品动态点击 <a href="${config.domain}/delete/${product.productId}">退订</a> ,将不再关注该商品所有款式的动态。</p>
              `
            };
            notify(fields, function(err, body){
              if(err) return console.error(err);
              console.log(body);
            });
          }
        });
      }
      // 完成对列的对比与更新
      callback(null, json);
    }).catch(function(err) {
      console.log(err);
    });
  });
}

function notify(fields) {
  sendMail(fields, function(err, body) {
    if (err) return console.error('发送邮件通知失败', err);
    console.log(body);
  });
}
