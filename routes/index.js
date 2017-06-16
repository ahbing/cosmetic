'use strict';
const express = require('express');
const router = express.Router();

const productProxy = require('../proxy/product.js');
const labelProxy = require('../proxy/label.js');
const getRemoteData = require('../lib/remote.js').getRemoteData;
const requireLogin = require('../lib/middleware/auth').requireLogin;
const requireRootLogin = require('../lib/middleware/auth').requireRootLogin;

/* GET home page. */
router.get('/', requireLogin, function(req, res, next) {

  let labelName = req.query.label;
  let qPage = req.query.page;
  let page = qPage ? qPage : 1;
  let per_page = req.query.per_page || 40;
  let user = req.session.user;
  labelName = labelName && labelName.trim();
  let query = {};
  if (labelName || labelName === '') {
    query = { labelName: labelName }
  }
  productProxy.getProductsCount(query).then(function(count) {
    let pagination = {
      page: page,
      per_page: per_page,
      total: count
    }
    productProxy.getProducts(+page, +per_page, query).then(function(products) {
      // console.log(products);
      labelProxy.getAllLabels().then(function(labels) {
        if (labelName === '' || !labelName) { // 被删除的商品查询
          products = products.filter(function(item) {
            return item.labelName !== 'deleted'
          });
        }
        res.render('index', { 
          products: products, 
          labels: labels, 
          labelName: labelName, 
          user: user,
          pagination: pagination
        });  
      })
    });
  });
});


// 添加新关注
router.get('/add/:productId/:storeId/:productBrand/:productTitle/:wcid', function(req, res, next) {
  // http://127.0.0.1:3000/add/1243730/10052/TOM%20FORD/Lip%20Colour/450-3001058-LIPCOLOR
  const productId = req.params.productId;
  const storeId = req.params.storeId;
  const productBrand = req.params.productBrand;
  const productTitle = req.params.productTitle;
  const wcid = req.params.wcid;
  const url = `http://www.selfridges.com/HK/en/webapp/wcs/stores/servlet/AjaxStockStatusView?productId=${productId}&storeId=${storeId}`;
  
  productProxy.getProductByProductId(productId).then(function(product) {
    if (product) {
      // 商品已经关注
      console.log('商品已经关注', productId);
      return res.status(304).json({ product: product });
    }
    // 获取远端库存数据
    getRemoteData(url, function(json) {
      const stocks = json.stocks;
      const newProductObj = {
        productId: productId,
        productBrand: productBrand,
        productTitle: productTitle,
        storeId: storeId,
        wcid: wcid,
        stocks: stocks
      };
      const newProduct = productProxy.newAndSave(newProductObj);
      newProduct.then(function(product) {
        console.log('添加成功', productId);
        return res.status(200).json({ product: product });
      }).catch(function(err) {
        console.error('添加失败', err);
        return res.status(500).json({ message: '添加商品失败', error: err });
      })
    });
  }).catch(function(err) {
    return console.log('查询商品失败', err);
  });
});

// 删除关注
router.get('/delete/:productId', requireRootLogin, function(req, res, next) {
  const productId = req.params.productId;
  productProxy.deleteProductById(productId).then(function(product) {
    console.log('删除成功', productId);
    // return res.status(200).json({ product: product });
    res.redirect('/');
  }).catch(function(err) {
    console.error('删除失败', err);
    // return res.status(500).json({ message: '删除商品失败', error: err });
    res.redirect('/');
  })
});


// 更新
router.post('/update', requireRootLogin, function(req, res, next) {
  const productId = req.body.productId;
  let colours = req.body.colours.trim();
  colours = colours ? colours.split('#') : [];
  const updateInfos = {
    colours : colours,
    // threshold : +req.body.threshold,  // 转化成数字
    nickname : req.body.nickname,
    status: req.body.status,
    labelName: req.body.labelName
  };
  productProxy.updateProductSetting(productId, updateInfos).then(function(product) {
    console.log('更新成功', productId);
    // return res.status(200).json({ product: product });
    res.redirect('/');
  }).catch(function(err) {
    console.error('更新失败', err);
    // return res.status(500).json({ message: '更新商品失败', error: err });
    res.redirect('/');
  })
});

module.exports = router;
