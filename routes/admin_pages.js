var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('admin pages');
});

//ADD PAGES
router.get('/add_pages', function(req, res, nexy) {
	var title = '';
	var slug = '';
	var content = '';
	res.render('admin/add_pages', { title: title, slug: slug, content: content });
});

module.exports = router;
