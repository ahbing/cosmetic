const request = require('request');
const config = require('../config.js');

exports.sendEmail = function(fields, callback) {
  fields = Object.assign({
    from: 'ahbing <mailgun@mg.ahbing.me>',
    to: '',
    subject: '',
    text: ''
  }, fields || {});

  request.post({
    url: 'https://api.mailgun.net/v3/' + config.mailgun.domain_name + '/messages',
    auth: {
      user: 'api',
      pass: config.mailgun.api_key
    },
    form: fields
  }, function(err, res, body) {
    if (err) return callback(err);
    callback(null, body);
  });
};