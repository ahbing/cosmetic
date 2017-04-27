#!/usr/bin/env node


const request = require('request');
const cheerio = require("cheerio");
const sendMail = require('./email').sendEmail;
const config = require('../config');


let lastFirstItem = '';
let count = 0;
let per = 10 * 60 * 1000; // 10min
let newestUrl = `http://www.selfridges.com/CN/en/cat/beauty/make-up/?ajax=true&fh_sort_by=newness%20|ASC`;
let options = {
  url: newestUrl,
  headers: {
    'User-Agent': 'request'
  }
}
let reqCallback = function(err, response, body) {
  
  let newFirstItem = '';
  let mailTo = config.mailto.success;
  let errorMailTo = config.mailto.error;
  let link = `http://www.selfridges.com/CN/en/cat/beauty/make-up/?fh_sort_by=newness%20|ASC`;
  let fields = {
    subject: `上新上新上新了`,
    to: mailTo,
    html: `
    <p>检测到了有新的商品上架了，点击下面链接购买</p>
    <a href="${link}">购买链接</a>
    <p>如果链接无效，请复制一下链接到浏览器</p>
    <p>${link}<p>
    <p>点此链接访问管理界面<a href=${config.domain}>${config.domain}</a></p>
    `
  };
  count++;
  if (!err && response.statusCode === 200) {
    var $ = cheerio.load(body);
    var $itemTitle = $('.productsInner .productContainer:first-child').find('.title');
    newFirstItem = $itemTitle.html();
  } else {
    Object.assign(fields, {
      subject: '上新任务查询错误',
      to: errorMailTo,
      html: `${link}===>${err}`
    });
    send(fields);
  }

  // 有最新上新了。
  console.log(`第 ${count} 次的上新查询`);
  // console.log('lastFirstItem', lastFirstItem);
  // console.log('newFirstItem', newFirstItem);
  // console.log('----------------------------');
  
  if (newFirstItem && newFirstItem !== lastFirstItem) {
    lastFirstItem = newFirstItem;
    // 第一次请求的结果不是上新结果。
    if (count === 1) return;
    send(fields);
  }
}

function send(fields) {
  sendMail(fields, function(err, body){
    if(err) return console.error(err);
    console.log(body);
  });
}
// 验证是否可以添加到购物车
function doRequest() {
  request(options, reqCallback);
}

doRequest();
setInterval(doRequest, per);





