var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');

// get pages
router.get('/', function(req, res, next) {
	res.send('admin pages');
});

//get add page
router.get('/add_pages', function(req, res, nexy) {
	var title = '';
	var slug = '';
	var content = '';
	res.render('admin/add_page', { title: title, slug: slug, content: content });
});
//add page
router.post(
	'/add_pages',
	[
		check('title', 'Invalid title').not().isEmpty().withMessage('title must not be empty'),
		check('content', 'Invalid content').not().isEmpty().withMessage('content must not be empty')
	],
	function(req, res, next) {
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
			console.log('ok');
		}
	}
);

module.exports = router;
