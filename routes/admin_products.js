var express = require('express');
var router = express.Router();
var path = require('path');
var mkdirp = require('mkdirp');
var fse = require('fs-extra');
var fs = require('fs');
var resizeImg = require('resize-img');
const { check, validationResult } = require('express-validator');
var Product = require('../models/product');
var Category = require('../models/category');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// get products
router.get('/', isAdmin, function (req, res, next) {

	var perPage = 2
	var page = req.query.page || 1

	Product
		.find({})
		.skip((perPage * page) - perPage)
		.limit(perPage)
		.exec(function (err, products) {
			Product.countDocuments().exec(function (err, c) {
				if (err) return next(err)
				res.render('admin/products', {
					products: products,
					current: page,
					productPages: Math.ceil(c / perPage),
					count: c
				})
			})
		})
});

//get add product
router.get('/add-product', isAdmin, function (req, res, nexy) {
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
router.get('/edit-product/:id', isAdmin, function (req, res, next) {
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

//edit product
router.post(
	'/edit-product/:id',
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
		var pimage = req.body.pimage;
		var id = req.params.id

		var errors = validationResult(req);

		if (!errors.isEmpty()) {
			req.session.errors = errors.array()
			res.redirect('/admin/products/edit-product/' + id)
		} else {
			Product.findOne({ slug: slug, _id: { $ne: id } }, function (err, product) {
				if (err) return console.log(err)
				if (product) {
					req.flash('danger', 'Product title already exist')
					res.redirect('/admin/products/edit-product/' + id)
				} else {
					Product.findById(id, function (err, product) {
						if (err) return console.log(err)
						product.title = title;
						product.slug = slug;
						product.desc = desc;
						product.category = category;
						product.price = parseFloat(price).toFixed(2);
						if (imageFile != '') {
							product.image = imageFile
						}

						product.save(function (err) {
							if (err) return console.log(err)

							if (imageFile != "") {
								if (pimage != "") {
									var pathFile = 'public/product_images/' + id + '/' + pimage;
									fse.remove(pathFile, function (err) {
										if (err) return console.log(err)
									})

								}

								var productImage = req.files.image;
								var pathFile = 'public/product_images/' + id + '/' + imageFile;
								productImage.mv(pathFile, function (err) {
									return console.log(err);
								});
							}

							req.flash('success', 'Product edited successfully');
							res.redirect('/admin/products/edit-product/' + id)
						})

					})
				}
			})
		}
	}

);
/*
 * POST upload gallery image
 */
router.post('/product-gallery/:id', function (req, res) {

	var productImage = req.files.file;
	var id = req.params.id;
	var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
	var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

	productImage.mv(path, function (err) {
		if (err)
			console.log(err);

		resizeImg(fse.readFileSync(path), { width: 100, height: 100 }).then(function (buf) {
			fse.writeFileSync(thumbsPath, buf);
		});
	});

	res.sendStatus(200);

});

/*
 * GET delete image
 */
router.get('/delete-image/:image', isAdmin, function (req, res) {

	var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
	var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

	fse.remove(originalImage, function (err) {
		if (err) {
			console.log(err);
		} else {
			fse.remove(thumbImage, function (err) {
				if (err) {
					console.log(err);
				} else {
					req.flash('success', 'Image deleted!');
					res.redirect('/admin/products/edit-product/' + req.query.id);
				}
			});
		}
	});
});

/*
 * GET delete product
 */

router.get('/delete-product/:id', isAdmin, function (req, res, next) {
	var id = req.params.id;
	var path = 'public/product_images/' + id
	fse.remove(path, function (err) {
		if (err) {
			return console.log(err)
		} else {
			Product.findByIdAndRemove(id, function (err) {
				if (err) return console.log(err)
				req.flash('success', 'Product deleted!');
				res.redirect('/admin/products');
			})
		}
	})
});

module.exports = router;
