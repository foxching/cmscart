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

	Product.count(function(err, c) {
		count = c;
	});

	Product.find(function(err, products) {
		res.render('admin/products', {
			products: products,
			count: count
		});
	});
});

module.exports = router;
