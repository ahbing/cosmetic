var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var requireLogin = require('./lib/middleware/auth').requireLogin;

var index = require('./routes/index');
var label = require('./routes/label');
var auth = require('./routes/auth');



var config = require('./config');

var app = express();

var redisClient = require('redis').createClient(config.redis.port, config.redis.host);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new RedisStore({ client: redisClient, ttl: 3 * 24 * 60 * 60 }),
  secret: config.session_keys,
  resave: false,
  saveUninitialized: false
}));

app.use('/auth', auth);
app.use('/', index);
app.use('/label', requireLogin, label);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
