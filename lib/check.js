#!/usr/bin/env node

const mapLimit = require("async/mapLimit");
const productProxy = require('../proxy/product');
const sendMail = require('./email').sendEmail;
const getRemoteData = require('./remote').getRemoteData;
const config = require('../config');
const request = require('request');
const cheerio = require("cheerio");
let count = 0;
checkProduct();
function checkProduct() {
  const per = .7 * 60 * 1000;  // 42s
  let startTime = Date.now();
  console.log('查询次数', ++count);
  console.log('开始时间为', new Date());
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
  if (product.status === false) return callback(null);
  const url = `http://www.selfridges.com/HK/en/webapp/wcs/stores/servlet/AjaxStockStatusView?productId=${product.productId}&storeId=${product.storeId}`;
  getRemoteData(url, function(json) {
    if (!json) return callback(null);  // 请求数据错误 json ==> null
    const newData = json.stocks; // arr
    const oldData = product.stocks;
    const colours = product.colours || [];
    const nickname = product.nickname || '';
    const threshold = 1;
    const updateTime = new Date();
    // 更新数据库数据
    
    productProxy.updateProductStocks(product.productId, newData, updateTime).then(function(newProduct) {
      if (newData.length !== oldData.length) {
        console.log('商品款式有所增加或减少');
      }
      const outOfStock = [];
      for(let i = 0, len = oldData.length; i < len; i++) {
        let oldItemData = oldData[i];
        // if (!oldItemData.inStock || oldItemData.qty <= threshold) {
        if (!oldItemData.inStock) {
          // 如果原来库存为零
          let colourValue = oldItemData.value;
          // 如果维护这 colours 则根据 colours 进行筛选
          if (colours.length && colours.some(function(e) { return e === colourValue }) || !colours.length) {
            outOfStock.push({
              index: i,
              oldItemData: oldItemData
            });
          }
        }
      }
      if(outOfStock.length) {
        outOfStock.forEach(function(item) {
          let index = item['index'];
          let oldItemData = item['oldItemData'];
          let newItemData = newData[index];
          let title = product.productTitle.split(' ').join('-');
          let brand = product.productBrand.split(' ').join('-');
          let productValue = '无名';
          if (newItemData && newItemData.value) {
            productValue = newItemData.value.split(' ').join('+');
          }
          productValue = escape(productValue);
          if (newItemData.sku === oldItemData.sku && newItemData.qty >= threshold) {
            // 组装通知内容
            let link = `http://www.selfridges.com/CN/en/cat/${title}-${brand}_${product.wcid}/?previewAttribute=${productValue}`;
            let mailTo = config.mailto.success;
            let productName = nickname ? nickname : title;
            let fields = {
              subject: `${productName}的${productValue}--库存更新提醒`,
              to: mailTo,
              html: `
              <p>你关注的商品${productName}的${productValue}款，当前库存量为<b>${newItemData.qty}</b>，点击下面链接购买</p>
              <a href="${link}">购买链接</a>
              <p>如果链接无效，请复制一下链接到浏览器</p>
              <p>${link}<p>
              <p>点此链接访问管理界面<a href=${config.domain}>${config.domain}</a></p>
              `
            };
            // 添加验证
            let addBagUrl = `http://www.selfridges.com/HK/en/webapp/wcs/stores/servlet/BasketAdd?&productId=${product.productId}&storeId=${product.storeId}&quantity=1&Colour=${productValue}`;
            let options = {
              url: addBagUrl,
              headers: {
                'User-Agent': 'request'
              }
            }
            let reqCallback = function(err, response, body) {
              if (!err && response.statusCode === 200) {
                var $ = cheerio.load(body);
                var $itemWrap = $('.itemWrap');
                if ($itemWrap.length === 1) {
                  // 确认可以添加到购物车
                  sendMail(fields, function(err, body){
                    if(err) return console.error(err);
                    console.log(body);
                  });
                } else {
                  console.log(`${new Date()}, 请求的 ${addBagUrl} 无法加入到购物车`);
                }
              } else {
                console.log(`${new Date()}, 请求 ${addBagUrl} 没有成功`);
              }
            }
            // 验证是否可以添加到购物车
            request(options, reqCallback);
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
