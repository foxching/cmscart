var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var Category = require('../models/category');

// get categories
router.get('/', function(req, res, next) {
	Category.find({}, function(err, categories) {
		if (err) return console.log(err);
		res.render('admin/categories', { categories: categories });
	});
});

//get add category
router.get('/add-category', function(req, res, nexy) {
	var title = '';
	res.render('admin/add_category', { title: title });
});

//post add category
router.post(
	'/add-category',
	[ check('title', 'Invalid title').not().isEmpty().withMessage('title must not be empty') ],
	function(req, res, next) {
		var title = req.body.title;
		var slug = title.replace(/\s+/g, '=').toLowerCase();

		var errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('admin/add_category', { title: title, errors: errors.array() });
		} else {
			Category.findOne({ slug: slug }, function(err, category) {
				if (category) {
					req.flash('danger', 'Category title already exists');
					res.render('admin/add_category', { title: title });
				} else {
					var category = new Category({
						title: title,
						slug: slug
					});

					category.save(function(err) {
						if (err) {
							console.log(err);
						}
						req.flash('success', 'Category added successfully');
						res.redirect('/admin/categories');
					});
				}
			});
		}
	}
);

//get edit page
router.get('/edit-category/:id', function(req, res, next) {
	Category.findById(req.params.id, function(err, category) {
		if (err) {
			console.log(err);
		}
		res.render('admin/edit_category', { title: category.title, id: category.id });
	});
});

//edit page
router.post(
	'/edit-category/:id',
	[ check('title', 'Invalid title').not().isEmpty().withMessage('title must not be empty') ],
	function(req, res, next) {
		var title = req.body.title;
		var slug = title.replace(/\s+/g, '=').toLowerCase();
		var id = req.params.id;

		var errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('admin/edit_category', {
				title: title,
				errors: errors.array(),
				id: id
			});
		} else {
			Category.findOne({ slug: slug, _id: { $ne: id } }, function(err, category) {
				if (category) {
					req.flash('danger', 'Category title already exists');
					res.render('admin/edit_category', { title: title, id: id });
				} else {
					Category.findById(id, function(err, category) {
						if (err) return console.log(err);

						category.title = title;
						category.slug = slug;
						category.save(function(err) {
							if (err) {
								console.log(err);
							}
							req.flash('success', 'Category edited successfully');
							res.redirect('/admin/categories/edit-category/' + id);
						});
					});
				}
			});
		}
	}
);

// get delete  category
router.get('/delete-category/:id', function(req, res, next) {
	Category.findByIdAndRemove(req.params.id, function(err) {
		if (err) return console.log(err);
		req.flash('success', 'Category  Deleted');
		res.redirect('/admin/categories');
	});
});

module.exports = router;
