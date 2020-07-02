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
router.get('/register', function(req, res) {
	if (res.locals.user) res.redirect('/');

	res.render('register', {
		title: 'Register',
		newUser: new User()
	});
});

/*
 * POST register
 */
router.post(
	'/register',
	[
		check('name', 'Invalid').not().isEmpty().withMessage('Name must not be empty'),
		check('email', 'invalid').isEmail().withMessage('Email is invalid'),
		check('username', 'Invalid Username ')
			.isLength({ min: 5 })
			.withMessage('Username must be at least 5 chars long'),
		check('password', 'Invalid Password ')
			.isLength({ min: 5 })
			.withMessage('Password must be at least 5 chars long'),
		check('password2').custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error('Password confirmation does not match password');
			}

			// Indicates the success of this synchronous custom validator
			return true;
		})
	],
	function(req, res, next) {
		var newUser = new User({
			name: req.body.name,
			email: req.body.email,
			username: req.body.username,
			password: req.body.password,
			admin: 0
		});

		var errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.render('register', {
				title: 'Register',
				errors: errors.array(),
				user: null,
				newUser: newUser
			});
		} else {
			User.findOne({ username: newUser.username }, function(err, user) {
				if (err) return console.log(err);
				if (user) {
					req.flash('danger', 'Username exists, choose another!');
					res.redirect('/users/register');
				} else {
					// var user = new User({
					// 	name: name,
					// 	email: email,
					// 	username: username,
					// 	password: password,
					// 	admin: 0
					// });

					bcrypt.genSalt(10, function(err, salt) {
						bcrypt.hash(newUser.password, salt, function(err, hash) {
							if (err) console.log(err);

							newUser.password = hash;

							newUser.save(function(err) {
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
router.get('/login', function(req, res) {
	if (res.locals.user) res.redirect('/');

	res.render('login', {
		title: 'Login'
	});
});

/*
 * POST login
 */

router.post('/login', function(req, res, next) {
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

/*
 * GET logout
 */
router.get('/logout', function(req, res) {
	req.logOut();
	req.flash('success', 'You are logged out');
	res.redirect('/users/login');
});

module.exports = router;
