var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var WebSocket = require('ws')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var Jwt = require('./methods/jwt_method.js');
const jwt_method = new Jwt();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req,res,next)=>{
	let url = req.originalUrl;
	let reg = /\s/g;
	try{
		if(url=='/api/v1/register'||url== '/api/v1/login'){
			next();
		}else{
			if(req.headers['authorization']){
				let _token = req.headers['authorization'].split(reg)[1];
				let tokenStatus = await jwt_method.verifyAuthToken(req,res,_token);
				if(tokenStatus){
					next();
				}else{
					return res.status(401).send({status:0,msg:'登录失效1'})
				}
			}else{
				return res.status(401).send({status:0,msg:'登录失效2'})
			}
		}			
	}catch(err){
		return res.status(500).send({status:0,msg:JSON.stringify(err)});
	}
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err)
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
