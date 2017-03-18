const sendMail = require('./email').sendEmail;
const fetch = require('node-fetch');

const config = require('../config');
const getRemoteData = exports.getRemoteData = function(url, callback) {
  fetch(url).then(function(res) {
    return res.json()
  }).then(function(json) {
    callback(json);
  }).catch(function(err) {
    callback(null); //请求数据出错
    sendMail({
      subject: '请求数据错误提醒',
      to: config.mailto.error,
      html: `<p>获取远程 ${url} 数据发生错误， ${err}</p>`
    }, function(err, body){
      if(err) return console.error(err);
      console.log('发送请求错误的通知邮件', body);
    })
    console.error(`${new Date()}，获取远程 ${url} 数据发生错误， ${err}`);
  });
};
