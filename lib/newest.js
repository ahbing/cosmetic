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
      let product = {
        index: index,
        title: title,
        des: description
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
  // console.log('oldLen',oldLen);
  // console.log('newLen',newLen);
  // console.log(oldProducts == newProducts)
  // 有最新上新了。
  
  for (let i = 0; i < oldLen; i++) {
    let oldItem = oldProducts[i];
    for (let j = 0; j < newLen; j++) {
      let newItem = newProducts[j];
      if (oldItem['index'] == newItem['index']) {
        if (oldItem['title'] !== newItem['title'] || oldItem['des'] !== newItem['des']) {
          console.log('old title:', oldItem['title'], '=======', 'new title:', newItem['title'])
          console.log('old des:', oldItem['des'], '=======', 'new des:', newItem['des'])
          Object.assign(fields, {
            subject: `上新了上新了`,
            to: mailTo,
            html: `
            <p>检测到第${j}个位置更换了商品，可能有新品上来了，点击下面链接购买</p>
            <a href="${link}">购买链接</a>
            <p>如果链接无效，请复制一下链接到浏览器</p>
            <p>${link}<p>
            <p>点此链接访问管理界面<a href=${config.domain}>${config.domain}</a></p>
            `
          });
          oldProducts = newProducts;
          send(fields);
          // 提前结束
          return;
        }
      }
    }
  }
  oldProducts = newProducts;
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





