var express = require('express');
var router = express.Router();

var Product = require('../models/product');

/* 
* GET
*/
router.get('/', function (req, res, next) {
	res.send('Cart')
});

router.get('/add/:product', function (req, res, next) {
	var slug = req.params.product
	Product.findOne({ slug: slug }, function (err, product) {
		if (err) return console.log(err)
		if (typeof req.session.cart == 'undefined') {
			req.session.cart = []
			req.session.cart.push({
				title: slug,
				qty: 1,
				price: parseFloat(product.price).toFixed(2),
				image: 'public/product_images/' + product.id + '/' + product.image
			})
		} else {
			var cart = req.session.cart
			var newItem = true
			for (var i = 0; i < cart.length; i++) {
				if (cart[i].title == slug) {
					cart[i].qty++
					newItem = false;
					break;
				}
			}
			if (newItem) {
				cart.push({
					title: slug,
					qty: 1,
					price: parseFloat(product.price).toFixed(2),
					image: 'public/product_images/' + product.id + '/' + product.image
				})
			}
		}
		//console.log(req.session.cart)
		req.flash('success', 'Product added to Cart')
		res.redirect('back')
	})
});



module.exports = router;
