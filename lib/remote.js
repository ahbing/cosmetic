const sendMail = require('./email').sendEmail;
const fetch = require('node-fetch');

const config = require('../config');
const getRemoteData = exports.getRemoteData = function(url, callback) {
  fetch(url).then(function(res) {
    return res.json()
  }).then(function(json) {
    callback(json);
  }).catch(function(err) {
    sendMail({
      subject: '商品查询应用错误提醒',
      to: config.error,
      html: `<p>获取远程 ${url} 数据发生错误， ${err}</p>`
    })
    console.error(`获取远程 ${url} 数据发生错误， ${err}`);
  });
};
