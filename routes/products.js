var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Category = require('../models/category');

/* 
* GET all products. 
*/
router.get('/', function(req, res, next) {
	Product.find(function(err, products) {
		if (err) console.log(err);
		res.render('all_products', { title: 'All Products', products: products });
	});
});

/* 
* GET products by category. 
*/
router.get('/:category', function(req, res, next) {
	var categorySlug = req.params.category;
	Category.find({ slug: categorySlug }, function(err, category) {
		if (err) return console.log(err);
		Product.find({ category: categorySlug }, function(err, products) {
			if (err) console.log(err);
			res.render('cat_products', { title: category.title, products: products });
		});
	});
});

module.exports = router;
