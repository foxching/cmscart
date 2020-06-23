var express = require('express');
var router = express.Router();
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
const { check, validationResult } = require('express-validator');
var Product = require('../models/product');
var Category = require('../models/category');

// get products
router.get('/', function (req, res, next) {
	var count;

	Product.countDocuments(function (err, c) {
		count = c;
	});

	Product.find(function (err, products) {
		res.render('admin/products', {
			products: products,
			count: count
		});
	});
});

//get add product
router.get('/add-product', function (req, res, nexy) {
	var title = '';
	var desc = '';
	var price = '';
	Category.find(function (err, categories) {
		res.render('admin/add_product', { title: title, desc: desc, categories: categories, price: price });
	});
});

//post add page
router.post(
	'/add-product',
	[
		check('title', 'Invalid title').not().isEmpty().withMessage('Title must not be empty'),
		check('desc', 'Invalid description').not().isEmpty().withMessage('Description must not be empty'),
		check('price', 'Invalid price')
			.not()
			.isEmpty()
			.withMessage('Price must not be empty')
			.isDecimal()
			.withMessage('Price must be decimal'),
		check('image', 'You must upload an image').custom(function (value, { req }) {
			if (!req.files) {
				imageFile = '';
			}
			if (req.files) {
				var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : '';
			}
			var extension = path.extname(imageFile).toLowerCase();
			switch (extension) {
				case '.jpg':
					return '.jpg';
				case '.jpeg':
					return '.jpeg';
				case '.png':
					return '.png';
				case '':
					return '.jpg';
				default:
					return false;
			}
		})
	],
	function (req, res, next) {
		var title = req.body.title;
		var slug = title.replace(/\s+/g, '=').toLowerCase();
		var desc = req.body.desc;
		var price = req.body.price;
		var category = req.body.category;
		var imageFile;
		if (!req.files) {
			imageFile = '';
		}
		if (req.files) {
			imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : '';
		}

		var errors = validationResult(req);
		if (!errors.isEmpty()) {
			//return res.status(422).json({ errors: errors.array() });
			Category.find(function (err, categories) {
				res.render('admin/add_product', {
					title: title,
					desc: desc,
					categories: categories,
					price: price,
					errors: errors.array()
				});
			});
		} else {
			Product.findOne({ slug: slug }, function (err, product) {
				if (product) {
					req.flash('danger', 'Product title already exists');
					Category.find(function (err, categories) {
						res.render('admin/add_product', {
							title: title,
							desc: desc,
							categories: categories,
							price: price
						});
					});
				} else {
					var price2 = parseFloat(price).toFixed(2);
					var product = new Product({
						title: title,
						slug: slug,
						desc: desc,
						price: price2,
						category: category,
						image: imageFile
					});

					product.save(function (err) {
						if (err) {
							console.log(err);
						}
						mkdirp('public/product_images/' + product._id, function (err) {
							return console.log(err);
						});

						mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
							return console.log(err);
						});

						mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
							return console.log(err);
						});

						if (imageFile != '') {
							var productImage = req.files.image;
							var pathFile = 'public/product_images/' + product._id + '/' + imageFile;
							productImage.mv(pathFile, function (err) {
								return console.log(err);
							});
						}

						req.flash('success', 'Product added successfully');
						res.redirect('/admin/products');
					});
				}
			});
		}
	}
);

//get edit product
router.get('/edit-product/:id', function (req, res, nexy) {
	var errors;
	if (req.session.errors) errors = req.session.errors;
	req.session.errors = null;

	Category.find(function (err, categories) {
		Product.findById(req.params.id, function (err, product) {
			if (err) {
				console.log(err);
				res.redirect('/admin/products');
			} else {
				var galleryDir = 'public/product_images/' + product._id + '/gallery';
				var galleryImages = null;
				fs.readdir(galleryDir, function (err, files) {
					if (err) {
						console.log(err);
					} else {
						galleryImages = files;
						res.render('admin/edit_product', {
							id: product._id,
							title: product.title,
							desc: product.desc,
							categories: categories,
							category: product.category.replace(/\s+/g, '=').toLowerCase(),
							price: parseFloat(product.price).toFixed(2),
							image: product.image,
							galleryImages: galleryImages,
							errors: errors
						});
					}
				});
			}
		});
	});
});

module.exports = router;
