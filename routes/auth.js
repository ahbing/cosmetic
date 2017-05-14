'use strict';
var express = require('express');
var router = express.Router();
var admin = require('../config').admin;

/* GET home page. */
router.get('/login', function(req, res, next) {
  res.render('login', {
    error: ''
  });
});

router.get('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) return next(err);
    res.status(204);
    res.redirect('/')
  });
});

router.post('/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var currentAdmin = null;
  admin.forEach(function(item, index) {
    if (username === item.username ) {
      currentAdmin = admin[index];
    }
  });
  if (currentAdmin && password === currentAdmin.password) {
    var root = currentAdmin.root;
    req.session.user = {
      username: username,
      password: password,
      root: root
    };
    res.redirect('/')
  } else {
    res.render('login', { error: '用户名或密码错误' })
  }

});

module.exports = router;