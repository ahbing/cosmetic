'use strict';
const express = require('express');
const router = express.Router();

const labelProxy = require('../proxy/label');
const requireRootLogin = require('../lib/middleware/auth').requireRootLogin;
// const getRemoteData = require('../lib/remote.js').getRemoteData;

/* GET home page. */
router.get('/', function(req, res, next) {
  let user = req.session.user;
  labelProxy.getAllLabels().then(function(labels) {
    res.render('label', {title: 'cosmetic-label', labels: labels, user:user});
  });
});

router.get('/delete/:labelId', requireRootLogin, function(req, res, next) {
  const labelId = req.params.labelId;
  labelProxy.removeLabelById(labelId).then(function(label) {
    console.log('删除成功', labelId);
    // return res.status(200).json({ label: label });
    res.redirect('/label');
  }).catch(function(err) {
    console.error('删除失败', err);
    // return res.status(500).json({ message: '删除商品失败', error: err });
    res.redirect('/label');
  })
})


router.post('/add', requireRootLogin, function(req, res, next) {
  let labelName = req.body.labelName;
  labelName = labelName && labelName.trim();
  if (!labelName) return res.redirect('/label');
  labelProxy.getLabelByName(labelName).then(function(label) {
    if (label.length) {
      // 标签已经存在
      console.log('标签已经存在', label.labelName);
      return res.status(304).json({ label: label });
    }
    const newLabel = labelProxy.newAndSave({labelName: labelName});
    newLabel.then(function(label) {
        console.log('添加成功', labelName);
        // return res.status(200).json({ label: label });
        return res.redirect('/label');
      }).catch(function(err) {
        console.error('添加失败', err);
        return res.status(500).json({ message: '添加商品失败', error: err });
      })
    }).catch(function(err) {
    return console.log('查询标签出错', err);
  });
  
});


module.exports = router;
