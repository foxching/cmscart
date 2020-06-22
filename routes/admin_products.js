var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var Product = require('../models/product');
var Category = require('../models/category');

// get products
router.get('/', function(req, res, next) {
	var count;

	Product.countDocuments(function(err, c) {
		count = c;
	});

	Product.find(function(err, products) {
		res.render('admin/products', {
			products: products,
			count: count
		});
	});
});

//get add product
router.get('/add-product', function(req, res, nexy) {
	var title = '';
	var desc = '';
	var price = '';
	Category.find(function(err, categories) {
		res.render('admin/add_product', { title: title, desc: desc, categories: categories, price: price });
	});
});

module.exports = router;
