'use strict';
const express = require('express');
const router = express.Router();

const productProxy = require('../proxy/product.js');
const getRemoteData = require('../lib/remote.js').getRemoteData;

/* GET home page. */
router.get('/', function(req, res, next) {
  productProxy.getAllProducts().then(function(products) {
    console.log('products', products);
    res.render('index', {title: 'cosmetic', products: products});
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
    console.log('product', product);
    if (product) {
      // 商品已经关注
      console.log('商品已经关注', product);
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
        console.log('添加成功', product);
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
router.get('/delete/:productId', function(req, res, next) {
  const productId = req.params.productId;
  productProxy.removeProductById(productId).then(function(product) {
    console.log('删除成功', product);
    // return res.status(200).json({ product: product });
    res.redirect('/');
  }).catch(function(err) {
    console.error('删除失败', err);
    // return res.status(500).json({ message: '删除商品失败', error: err });
    res.redirect('/');
  })
});


// 更新
router.post('/update', function(req, res, next) {
  const productId = req.body.productId;
  let colours = req.body.colours.trim().split('#');

  const updateInfos = {
    colours : colours,
    threshold : req.body.threshold,
    nickname : req.body.nickname
  };
  productProxy.updateProductSetting(productId, updateInfos).then(function(product) {
    console.log('更新成功', product);
    // return res.status(200).json({ product: product });
    res.redirect('/');
  }).catch(function(err) {
    console.error('更新失败', err);
    // return res.status(500).json({ message: '更新商品失败', error: err });
    res.redirect('/');
  })
});

module.exports = router;
