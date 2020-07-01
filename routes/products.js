var express = require('express');
var router = express.Router();
var fse = require('fs-extra');
var Product = require('../models/product');
var Category = require('../models/category');

/* 
* GET all products. 
*/
router.get('/', function (req, res, next) {
	var perPage = 6
	var page = req.query.page || 1
	Product.find({})
		.skip((perPage * page) - perPage)
		.limit(perPage)
		.exec(function (err, products) {
			Product.countDocuments().exec(function (err, c) {
				if (err) return next(err)
				res.render('all_products', {
					title: 'All Products',
					products: products,
					current: page,
					productPages: Math.ceil(c / perPage),
				})
			})
		})

});

/* 
* GET products by category. 
*/
router.get('/:category', function (req, res, next) {
	var categorySlug = req.params.category;
	Category.findOne({ slug: categorySlug }, function (err, category) {
		if (err) return console.log(err);
		Product.find({ category: categorySlug }, function (err, products) {
			if (err) console.log(err);
			res.render('cat_products', { title: category.title, products: products });
		});
	});
});

router.get('/:category/:product', function (req, res, next) {
	var galleryImages = null;
	var loggedIn = req.isAuthenticated() ? true : false;
	Product.findOne({ slug: req.params.product }, function (err, product) {
		if (err) {
			console.log(err);
		} else {
			var galleryDir = 'public/product_images/' + product.id + '/gallery';
			fse.readdir(galleryDir, function (err, files) {
				if (err) {
					console.log(err);
				} else {
					galleryImages = files;
					res.render('product', {
						title: product.title,
						product: product,
						galleryImages: galleryImages,
						loggedIn: loggedIn
					});
				}
			});
		}
	});
});

module.exports = router;
