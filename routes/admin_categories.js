var express = require('express');
var router = express.Router();
var Category = require('../models/category');

// get pages
router.get('/', function(req, res, next) {
	Category.find({}, function(err, categories) {
		if (err) return console.log(err);
		res.render('admin/categories', { categories: categories });
	});
});

module.exports = router;
