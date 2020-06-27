var express = require('express');
var router = express.Router();
var fse = require('fs-extra');
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

router.get('/:category/:product', function(req, res, next) {
	var galleryImages = null;
	Product.findOne({ slug: req.params.product }, function(err, product) {
		if (err) {
			console.log(err);
		} else {
			var galleryDir = 'public/product_images/' + product.id + '/gallery';
			fse.readdir(galleryDir, function(err, files) {
				if (err) {
					console.log(err);
				} else {
					galleryImages = files;
					res.render('product', { title: product.title, product: product, galleryImages: galleryImages });
				}
			});
		}
	});
});

module.exports = router;
