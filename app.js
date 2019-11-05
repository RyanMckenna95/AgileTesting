var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const movie = require('./routes/movie');
const  show = require('./routes/show');
const review = require('./routes/review');

var app = express();

if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/movie',movie.findAllMovies);
app.get('/movie/:id',movie.findOneByID);
app.post('/movie', movie.addMovie);
app.put('/movie/:id/purchase', movie.purchaseMovie);
app.delete('/movie/:id',movie.deleteMovie);

app.get('/show',show.findAllShows);
app.get('/show/:id',show.findOneByID);
app.post('/show', show.addShow);
app.put('/show/:id/purchase', show.purchaseShow);
app.delete('/show/:id', show.deleteShow);

app.get('/review',review.findAllReviews);
app.get('/review/:id',review.findOneByID);
app.get('/review/author/:author',review.findByAuthor)
app.post('/review/write/:id',review.addReviewMovie);
app.put('/review/:id/like',review.likeReview);
app.delete('/review/:id',review.deleteReview);
app.put('/review/edit/:id',review.editReview);


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
