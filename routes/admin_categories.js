var express = require('express');
var router = express.Router();
var Category = require('../models/category');

// get pages
router.get('/', function(req, res, next) {
	res.send('category index');
});

module.exports = router;
