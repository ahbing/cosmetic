const fetch = require('node-fetch');
const getRemoteData = exports.getRemoteData = function(url, callback) {
  fetch(url).then(function(res) {
    return res.json()
  }).then(function(json) {
    callback(json);
  }).catch(function(err) {
    console.error(`获取远程 ${url} 数据发生错误， ${err}`);
  });
};
