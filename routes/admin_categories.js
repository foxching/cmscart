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

module.exports = router;