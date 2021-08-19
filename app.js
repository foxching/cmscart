var createError = require('http-errors');
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var fileUpload = require('express-fileupload');
var passport = require('passport');

//init app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

//express fileupload middleware
app.use(fileUpload());

// Body Parser middleware
// parse application/x-www-form-urlencoded
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//global variables
app.locals.errors = null;

//Page Model
var Page = require('./models/page');

//pages variables
Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
	if (err) {
		console.log(err);
	} else {
		app.locals.pages = pages;
	}
});

//Page Model
var Category = require('./models/category');

Category.find(function (err, categories) {
	if (err) {
		console.log(err);
	} else {
		app.locals.categories = categories;
	}
});

//express-session Middleware
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
app.use(function (req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
	res.locals.cart = req.session.cart;
	res.locals.user = req.user || null;
	next();
});

//set routes
var pages = require('./routes/pages');
var products = require('./routes/products');
var cart = require('./routes/cart');
var user = require('./routes/user');
var admin_pages = require('./routes/admin_pages');
var admin_categories = require('./routes/admin_categories');
var admin_products = require('./routes/admin_products');

app.use('/admin/pages', admin_pages);
app.use('/admin/categories', admin_categories);
app.use('/admin/products', admin_products);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', user);
app.use('/', pages);

//mongodb connection
if (process.env.NODE_ENV !== 'production') {
	require('dotenv/config');
}

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
	console.log('Connected to DB');
});
mongoose.set('useCreateIndex', true);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
// 	next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
// 	// set locals, only providing error in development
// 	res.locals.message = err.message;
// 	res.locals.error = req.app.get('env') === 'development' ? err : {};

// 	// render the error page
// 	res.status(err.status || 500);
// 	res.render('error');
// });

// module.exports = app;
