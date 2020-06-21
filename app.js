var createError = require('http-errors');
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var fileUpload = require('express-fileupload');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv/config');
}

var pages = require('./routes/pages');
var admin_pages = require('./routes/admin_pages');
var admin_categories = require('./routes/admin_categories');
var admin_products = require('./routes/admin_products');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//express fileupload middleware
app.use(fileUpload());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//global variables
app.locals.errors = null;

//express-session
app.use(
	session({
		secret: 'keyboard cat',
		resave: true,
		saveUninitialized: true
		//cookie: { secure: true }
	})
);

//express-messages
app.use(require('connect-flash')());
app.use(function(req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
});

app.use('/admin/pages', admin_pages);
app.use('/admin/categories', admin_categories);
app.use('/admin/products', admin_products);
app.use('/', pages);

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
	console.log('Connected to DB');
});
mongoose.set('useCreateIndex', true);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
