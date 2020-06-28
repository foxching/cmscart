var express = require('express');
var router = express.Router();
var Product = require('../models/product');

/* 
* GET cart
*/
router.get('/', function(req, res, next) {
	res.send('Cart');
});

/* 
* ADD product to cart
*/
router.get('/add/:product', function(req, res, next) {
	var slug = req.params.product;
	Product.findOne({ slug: slug }, function(err, product) {
		if (err) return console.log(err);
		if (typeof req.session.cart == 'undefined') {
			req.session.cart = [];
			req.session.cart.push({
				title: slug,
				qty: 1,
				price: parseFloat(product.price).toFixed(2),
				image: '/product_images/' + product.id + '/' + product.image
			});
		} else {
			var cart = req.session.cart;
			var newItem = true;
			for (var i = 0; i < cart.length; i++) {
				if (cart[i].title == slug) {
					cart[i].qty++;
					newItem = false;
					break;
				}
			}
			if (newItem) {
				cart.push({
					title: slug,
					qty: 1,
					price: parseFloat(product.price).toFixed(2),
					image: '/product_images/' + product.id + '/' + product.image
				});
			}
		}
		console.log(req.session.cart);
		req.flash('success', 'Product added to Cart');
		res.redirect('back');
	});
});

/* 
* GET cart checkout 
*/
router.get('/checkout', function(req, res, next) {
	if (req.session.cart && req.session.cart.length == 0) {
		delete req.session.cart;
		res.redirect('/cart/checkout');
	} else {
		res.render('checkout', {
			title: 'Checkout',
			cart: req.session.cart
		});
	}
});

/* 
* UPDATE cart product quantity
*/

router.get('/update/:product', function(req, res, next) {
	var product = req.params.product;
	var cart = req.session.cart;
	var action = req.query.action;

	for (var i = 0; i < cart.length; i++) {
		if (cart[i].title == product) {
			switch (action) {
				case 'add':
					cart[i].qty++;
					break;
				case 'remove':
					cart[i].qty--;
					if (cart[i].qty < 1) {
						cart.splice(i, 1);
					}
					break;
				case 'clear':
					cart.splice(i, 1);
					if (cart.length == 0) {
						delete req.session.cart;
					}
					break;
				default:
					console.log('updating problem');
					break;
			}
		}
	}
	req.flash('success', 'Cart product updated');
	res.redirect('/cart/checkout');
});

/* 
* clear all cart item
*/
router.get('/clear', function(req, res, next) {
	delete req.session.cart;
	req.flash('success', 'Cart Items cleared');
	res.redirect('/cart/checkout');
});

module.exports = router;
