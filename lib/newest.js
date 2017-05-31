#!/usr/bin/env node


const request = require('request');
const cheerio = require("cheerio");
const sendMail = require('./email').sendEmail;
const config = require('../config');


let lastFirstItem = lastFirstItemDes = '';
let count = 0;
let per = .5 * 60 * 1000; // 30s
let newestUrl = `http://www.selfridges.com/CN/en/cat/beauty/make-up/?ajax=true&fh_sort_by=newness%20|ASC`;
let options = {
  url: newestUrl,
  headers: {
    'User-Agent': 'request'
  }
}
let reqCallback = function(err, response, body) {
  
  let newFirstItem = newFirstItemDes = '';
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
    var $ = cheerio.load(body);
    var $productContainer = $('.productsInner .productContainer:first-child');
    var $itemTitle = $productContainer.find('.title');
    var $itemDes = $productContainer.find('.description');
    newFirstItem = $itemTitle.html();
    newFirstItemDes = $itemDes.html();
  } else {
    console.log('上新请求失败');
    console.log(`${new Date()}`);
    return send(fields);
  }
  console.log(`第 ${count} 次的上新查询`);
  console.log(`${new Date()}`)
  console.log('newFirstItem===  ', newFirstItem);
  console.log('newFirstItemDes===  ', newFirstItemDes);
  console.log('lastFirstItem===  ', lastFirstItem);
  console.log('lastFirstItemDes===  ', lastFirstItemDes);
  console.log('----------------------------');
  // 有最新上新了。
  if (!!newFirstItemDes && !!newFirstItem && newFirstItemDes !== lastFirstItemDes && newFirstItem !== lastFirstItem) {
    lastFirstItemDes = newFirstItemDes;
    lastFirstItem = newFirstItem;
    // 第一次请求的结果不是上新结果。
    if (count === 1) return;
    Object.assign(fields, {
      subject: `上新了${newFirstItem}`,
      to: mailTo,
      html: `
      <p>检测到${newFirstItem}：${newFirstItemDes}上架了，点击下面链接购买</p>
      <a href="${link}">购买链接</a>
      <p>如果链接无效，请复制一下链接到浏览器</p>
      <p>${link}<p>
      <p>点此链接访问管理界面<a href=${config.domain}>${config.domain}</a></p>
      `
    });
    send(fields);
  }
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





