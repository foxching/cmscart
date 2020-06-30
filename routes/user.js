var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// Get Users model
var User = require('../models/user');

/*
 * GET register
 */
router.get('/register', function (req, res) {
	res.render('register', {
		title: 'Register'
	});
});

/*
 * POST register
 */
router.post(
	'/register',
	[
		check('name', 'Invalid').not().isEmpty().withMessage('Name must not be empty'),
		check('email', 'Invalid email')
			.not()
			.isEmpty()
			.withMessage('Email must not be empty')
			.isEmail()
			.withMessage('Email is invalid'),
		check('username', 'Invalid Username ').not().isEmpty().withMessage('Username must not be empty'),
		check('password', 'Invalid Password ').not().isEmpty().withMessage('Password must not be empty'),
		check('password2', 'Invalid Password2 ')
			.not()
			.isEmpty()
			.withMessage('Please confirm your password ')
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error('Password confirmation does not match password');
				}

				// Indicates the success of this synchronous custom validator
				return true;
			})
	],
	function (req, res) {
		var name = req.body.name;
		var email = req.body.email;
		var username = req.body.username;
		var password = req.body.password;
		//var password2 = req.body.password2;

		var errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.render('register', {
				errors: errors.array(),
				user: null,
				title: 'Register'
			});
		} else {
			User.findOne({ username: username }, function (err, user) {
				if (err) return console.log(err);
				if (user) {
					req.flash('danger', 'Username exists, choose another!');
					res.redirect('/users/register');
				} else {
					var user = new User({
						name: name,
						email: email,
						username: username,
						password: password,
						admin: 0
					});

					bcrypt.genSalt(10, function (err, salt) {
						bcrypt.hash(user.password, salt, function (err, hash) {
							if (err) console.log(err);

							user.password = hash;

							user.save(function (err) {
								if (err) {
									console.log(err);
								} else {
									req.flash('success', 'You are now registered!');
									res.redirect('/users/login');
								}
							});
						});
					});
				}
			});
		}
	}
);

/*
 * GET login
 */
router.get('/login', function (req, res) {
	if (res.locals.user) res.redirect('/');

	res.render('login', {
		title: 'Login'
	});
});

/*
 * POST login
 */
router.post('/login', function (req, res, next) {
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

/*
 * GET logout
 */
router.get('/logout', function (req, res) {
	req.logOut()
	req.flash('success', 'You are logged out')
	res.redirect('/users/login')
});

module.exports = router;
