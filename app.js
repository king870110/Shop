var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/pages/login');
var signupRouter = require('./routes/pages/signup');
var homepageRouter = require('./routes/pages/homepage');
var navRouter = require('./routes/parts/nav');
var profileRouter = require('./routes/pages/profile')
var updatePasswordRouter = require('./routes/pages/updatePassword')
var orderRouter = require('./routes/pages/order')
var purchaseRouter = require('./routes/pages/purchase')
var vendorRouter = require('./routes/pages/vendor')
var productRouter = require('./routes/pages/product')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/homepage', homepageRouter);
app.use('/nav', navRouter);
app.use('/profile', profileRouter)
app.use('/updatePassword', updatePasswordRouter)
app.use('/order', orderRouter)
app.use('/purchase', purchaseRouter)
app.use('/vendor', vendorRouter)
app.use('/product',productRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(err.message)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
