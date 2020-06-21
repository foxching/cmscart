var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var Product = require('../models/product');

// get products
router.get('/', function(req, res, next) {
	res.send('Admin Products');
});

module.exports = router;
