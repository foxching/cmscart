var express = require('express');
var router = express.Router();

var Product = require('../models/product');

/* 
* . 
*/
router.get('/', function (req, res, next) {
	res.send('Cart')
});



module.exports = router;
