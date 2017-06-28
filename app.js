var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

//var routes = require('./routes/index');

let uber= require('./routes/uber');
let api= require('./routes/api')
//var oauthCheck=require('./routes/oauthCheck')
//let config= require('./config/uber_config')

var app = express();


//set up mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/project_car');
var db = mongoose.connection;
db.once('open', function () {
    console.log('Connection successful.')
})



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//goDoTwitterAuth({secret: 'fsdijfsdlkfjsldf', authToken: 'skjdghshfw9hf89'});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function (req, res, next) {
  console.log('Received ' + req.method + ' for ' + req.url);
  next();
});

//Pass anything other than /api to Angular
//Pass anything other than mounted routes to Angular
app.use(express.static(path.join(__dirname, 'public')));


//Back end APIis sered on the /api route
app.use(cors())
app.use('/uber',uber)


app.use('/api',api)






//app.use('/config',config)
// app.use('*',function(req,rep,next){
//   res.send('/public/index.html')
// })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
