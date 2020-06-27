var express = require('express');
var router = express.Router();
var Product = require('../models/product')

/* 
* GET all products. 
*/
router.get('/', function (req, res, next) {
  Product.find(function (err, products) {
    if (err) console.log(err)
    res.render('all_products', { title: 'All Products', products: products })
  })
});

/* 
* GET products by category. 
*/
router.get('/:slug', function (req, res, next) {
  Product.find(function (err, products) {
    if (err) console.log(err)
    res.render('all_products', { title: 'All Products', products: products })
  })
});


module.exports = router;
