#!/usr/bin/env node

const request = require('request');
const cheerio = require("cheerio");
const sendMail = require('./email').sendEmail;
const config = require('../config');

let lastFirstItem = lastFirstItemDes = '';
let oldProducts = [];
let newProducts = null;
let count = 0;
let per =  40 * 1000; // 40s
let newestUrl = `http://www.selfridges.com/CN/en/cat/beauty/make-up/?ajax=true&fh_sort_by=newness%20|ASC`;
let options = {
  url: newestUrl,
  headers: {
    'User-Agent': 'request'
  }
}

let reqCallback = function(err, response, body) {
  newProducts = [];
  let mailTo = config.mailto.success;
  let errorMailTo = config.mailto.error;
  let link = `http://www.selfridges.com/CN/en/cat/beauty/make-up/?fh_sort_by=newness%20|ASC`;
  let fields = {
    subject: '上新任务查询错误',
    to: errorMailTo,
    html: `${link}===>${err}`
  };
  count++;
  if (!err && response.statusCode === 200) {
    let $ = cheerio.load(body);
    let $productContainers = $('.productsInner .productContainer');
    $productContainers.each(function(index) {
      let title = $(this).find('.title').html();
      let description = $(this).find('.description').html();
      let token = index + '_' + title + '_' + description;
      let url = $(this).children('a').attr('href');
      let product = {
        index: index,
        token: token,
        url: url
      };
      newProducts.push(product);
    });
  } else {
    console.log('上新请求失败');
    console.log(`${new Date()}`);
    return send(fields);
  }
  

  let oldLen = oldProducts.length;
  let newLen = newProducts.length;
  console.log(`第 ${count} 次的上新查询，${new Date()}`);
  console.log('oldLen',oldLen);
  console.log('newLen',newLen);
  console.log(oldProducts == newProducts)
  // 有最新上新了。
  if (oldLen === newLen) {
    for (let i = 0; i < oldLen; i++) {
      let oldItem = oldProducts[i];
      let newItem = newProducts[i];
      let newItemToken = newItem['token'];
      if (oldItem['token'] !== newItemToken) {
        console.log('================================================');
        console.log('old token:', oldItem['token'], '=======', 'new token:', newItemToken);
        console.log('================================================');
        let url = newItem['url'];
        Object.assign(fields, {
          subject: `上新了${newItemToken}上新了`,
          to: mailTo,
          html: `
          <p>检测到${newItemToken}有新品上来了，点击下面链接购买</p>
          <a href="${url}">直达上新商品链接</a>
          <br/>
          <br/>
          <a href="${link}">上新页面链接</a>
          <p>点此链接访问管理界面<a href=${config.domain}>${config.domain}</a></p>
          `
        });
        oldProducts = newProducts;
        newProducts = null;
        send(fields);
        return;
      }
    }
  }

  oldProducts = newProducts;
  newProducts = null;
  console.log('----------------------------');
}

function send(fields) {
  sendMail(fields, function(err, body){
    if(err) return console.error(err);
    console.log(body);
  });
}

function doRequest() {
  request(options, reqCallback);
}

doRequest();
setInterval(doRequest, per);





