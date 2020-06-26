var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var Page = require('../models/page');

// get pages
router.get('/', function (req, res, next) {
	Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
		res.render('admin/pages', { pages: pages });
	});
});

//get add page
router.get('/add-page', function (req, res, nexy) {
	var title = '';
	var slug = '';
	var content = '';
	res.render('admin/add_page', { title: title, slug: slug, content: content });
});

//post add page
router.post(
	'/add-page',
	[
		check('title', 'Invalid title').not().isEmpty().withMessage('title must not be empty'),
		check('content', 'Invalid content').not().isEmpty().withMessage('content must not be empty')
	],
	function (req, res, next) {
		var title = req.body.title;
		var slug = req.body.slug.replace(/\s+/g, '=').toLowerCase();
		if (slug == '') {
			slug = title.replace(/\s+/g, '=').toLowerCase();
		}
		var content = req.body.content;

		var errors = validationResult(req);
		if (!errors.isEmpty()) {
			//return res.status(422).json({ errors: errors.array() });
			res.render('admin/add_page', { title: title, slug: slug, content: content, errors: errors.array() });
		} else {
			Page.findOne({ slug: slug }, function (err, page) {
				if (page) {
					req.flash('danger', 'Page slug already exists');
					res.render('admin/add_page', { title: title, slug: slug, content: content });
				} else {
					var page = new Page({
						title: title,
						content: content,
						slug: slug,
						sorting: 100
					});

					page.save(function (err) {
						if (err) {
							console.log(err);
						}
						Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
							if (err) {
								console.log(err)
							} else {
								req.app.locals.pages = pages
							}
						});
						req.flash('success', 'Page added successfully');
						res.redirect('/admin/pages');
					});
				}
			});
		}
	}
);

//get edit page
router.get('/edit-page/:id', function (req, res, nexy) {
	Page.findById(req.params.id, function (err, page) {
		if (err) {
			console.log(err);
		}
		res.render('admin/edit_page', { title: page.title, slug: page.slug, content: page.content, id: page._id });
	});
});

//edit page
router.post(
	'/edit-page/:id',
	[
		check('title', 'Invalid title').not().isEmpty().withMessage('title must not be empty'),
		check('content', 'Invalid content').not().isEmpty().withMessage('content must not be empty')
	],
	function (req, res, next) {
		var title = req.body.title;
		var slug = req.body.slug.replace(/\s+/g, '=').toLowerCase();
		if (slug == '') {
			slug = title.replace(/\s+/g, '=').toLowerCase();
		}
		var content = req.body.content;
		var id = req.params.id;

		var errors = validationResult(req);
		if (!errors.isEmpty()) {
			//return res.status(422).json({ errors: errors.array() });
			res.render('admin/edit_page', {
				title: title,
				slug: slug,
				content: content,
				id: id,
				errors: errors.array()
			});
		} else {
			Page.findOne({ slug: slug, _id: { $ne: id } }, function (err, page) {
				if (page) {
					req.flash('danger', 'Page slug already exists');
					res.render('admin/edit_page', { title: title, slug: slug, content: content, id: id });
				} else {
					Page.findById(id, function (err, page) {
						if (err) return console.log(err);

						page.title = title;
						page.slug = slug;
						page.content = content;

						page.save(function (err) {
							if (err) {
								console.log(err);
							}
							Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
								if (err) {
									console.log(err)
								} else {
									req.app.locals.pages = pages
								}
							});
							req.flash('success', 'Page updated Successfully');
							res.redirect('/admin/pages/edit-page/' + id);
						});
					});
				}
			});
		}
	}
);

// get delete  page
router.get('/delete-page/:id', function (req, res, next) {
	Page.findByIdAndRemove(req.params.id, function (err) {
		if (err) return console.log(err);
		Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
			if (err) {
				console.log(err)
			} else {
				req.app.locals.pages = pages
			}
		});
		req.flash('success', 'Page Deleted');
		res.redirect('/admin/pages');
	});
});

// reorder-pages
router.post('/reorder-pages', function (req, res, next) {
	var ids = req.body['id[]'];
	sortPages(ids, function () {
		Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
			if (err) {
				console.log(err)
			} else {
				req.app.locals.pages = pages
			}
		});
	})
});

function sortPages(ids, callback) {
	var count = 0;
	for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		count++;

		(function (count) {
			Page.findById(id, function (err, page) {
				page.sorting = count;
				page.save(function (err) {
					if (err) {
						console.log(err);
					}
					count++
					if (count >= ids.length) {
						callback()
					}
				});
			});
		})(count);
	}
}

module.exports = router;
