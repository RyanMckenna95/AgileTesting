# Assignment 1 - Agile Software Practice.

Name: Ryan Mckenna

## Overview.

MovieLovers is ment to be a web app to allow the selling of movie and shows. with users able to leave reviews on movies only at the moment.
The reviews can only be left on movies that excist in the database. and both shows and movies can only be 
deleted if their stock is zero.

### github link : https://github.com/RyanMckenna95/AgileTesting
## API endpoints.

 . . . . . List the API's endpoints and state the purpose of each . . . . 
 
 e.g.

 + GET /movie - Get all movies.
 + GET /movie/:id - Get movie by ID.
 + POST /movie - adds a movie to the database.
 + PUT  /movie/:id/purchase - lowers the stock by -1. only if stock is above 0.
 + DELETE /movie/:id - deletes the movie found by its ID.
 <br> <br>
 + GET /show - Get all shows.
 + GET /show/:id - Get movie by ID.
 + POST /show - adds a show to the database.
 + PUT  /show/:id/purchase - lowers the stock by -1. only if stock is above 0
 + DELETE  /show/:id - deletes the show found by its ID.
 <br><br>
 + GET /review -Gets all reviews
 + GET /review/:id - Gets reviews by ID
 + GET /review/author/:author - Gets reviews that an author has wrote.
 + POST /review/write/:id - adds a review. checks the movie db that movieID is valid
 + PUT /review/:id/like - adds a like to the review.
 + DELETE /review/:id - deletes review.
 + PUT /review/edit/:id - edits an existing review.


## Data model.

 The data model is made of three models. movies, shows, and reviews. movies and shows can be purchased, this lowers the stock.
 Both movies and shows can only be deleted if their stock is at zero. this is to stop admin accidentally removing a show or movie and 
 having a stock of them with no record.
 <br> A review can only be writen about a movie if the movieID is found in the movies model. Reviews also have a likes system that is zero by default.<br>
 
### movies 
~~~
[
    {
        "_id", "5dc196ab8f003d462cbc23b0",
        "title", "Avatar",
        "released", "2012",
        "cost", 24,
        "stock", 133
    }
]
~~~

### shows

~~~
[
    {
        "_id", "5dc196ab8f003d462cbc2395",
        "title", "The boys",
        "released", "2019",
        "cost", 10,
        "stock", 1765
    }
]
~~~

### reviews
~~~
[
    {
        "_id", "5dc196aa8f003d462cbc2366",
        "author", "Joe Johnson"
        "titleID", "5dc196ab8f003d462cbc23b0",
        "reviewedTitle", "Avatar",
        "review", "master piece",
        "rating", 8,
        "likes", 1
    }
]
~~~
![][datamodel]


## Sample Test execution.



~~~
  Reviews
      GET /review
  (node:30624) DeprecationWarning: current URL string parser is deprecated, and will be removed in a future version. To use the new parser, pass option { useNewUrlParser: true } to MongoClient.connect.
  (node:30624) DeprecationWarning: current Server Discovery and Monitoring engine is deprecated, and will be removed in a future version. To use the new Server Discover and Monitoring engine, pass option { useUnifie
  dTopology: true } to the MongoClient constructor.
  GET /review 200 6.802 ms - 814
        √ should GET all reviews
      GET /review/id
        when the id is valid
  GET /review/5dc1988dc5d8f677a0378b7b 200 2.118 ms - 282
          √ should return the matching review ID
        when the id is invalid
  GET /review/9919191 200 1.557 ms - 233
          √ should return the not found message
      GET /review/:author
        when the author is valid
  GET /review/author/Joe%20Johnson 200 1.592 ms - 282
          √ should return reviews matching the author
        when the author is not valid name
  GET /review/author/tom%20cory 200 1.211 ms - 44
          √ should return the not found message
      POST /review/write/:id
        when the movie id is valid
          √ should add the review
      PUT /review/:id/like
        when the id is valid
  POST /review/write/5dc1988dc5d8f677a0378b8a 200 15.667 ms - 218
          √ should add a like to the review
          when the id is invalid
  PUT /review/5dc1988dc5d8f677a0378b90/like 200 5.396 ms - 26
  (node:30624) UnhandledPromiseRejectionWarning: AssertionError: Target cannot be null or undefined.
      at C:\Users\mcken\Desktop\year 4\webApp1\MovieLovers\test\functional\api/reviewsTest.js:254:44
      at process._tickCallback (internal/process/next_tick.js:68:7)
  (node:30624) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handl
  ed with .catch(). (rejection id: 1)
  (node:30624) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
  PUT /review/111111111/like 200 0.497 ms - 239
            √ should error message saying not found
      DELETE /review/:id
        when the id is valid
  (node:30624) DeprecationWarning: Mongoose: `findOneAndUpdate()` and `findOneAndDelete()` without the `useFindAndModify` option set to false are deprecated. See: https://mongoosejs.com/docs/deprecations.html#-finda
  ndmodify-
  DELETE /review/5dc1988dc5d8f677a0378b98/ 200 3.651 ms - 37
          √ should DELETE the matching review
        when the id is invalid
  DELETE /review/999999/ 200 0.330 ms - 232
          √ should return an error saying invalid
      PUT /review/edit/:id
        when the id is valid
          √ should update the review
  
    Shows
  Successfully Connected to [ fc5cdb14-58c3-4765-a8dd-31156e4914e8 ]
  Successfully Connected to [ fc5cdb14-58c3-4765-a8dd-31156e4914e8 ]
  Successfully Connected to [ fc5cdb14-58c3-4765-a8dd-31156e4914e8 ]
      GET /show
  GET /show 200 1.664 ms - 624
        √ should GET all shows
      GET /show/id
        when the id is valid
  GET /show/5dc1988dc5d8f677a0378ba6 200 1.589 ms - 208
          √ should return the matching show ID
        when the id is invalid
  GET /show/9919191 200 0.509 ms - 229
          √ should return the not found message
      POST /show
  POST /show 200 1.751 ms - 157
        √ should return conformation message and update the datastore
      DELETE /show/:id
        when the id is valid and stock is 0
  DELETE /show/5dc1988dc5d8f677a0378bb2/ 200 2.427 ms - 39
          √ should DELETE the matching movie
        when the id is invalid
  DELETE /show/8888888/ 200 2.098 ms - 28
          √ should return an error saying invalid
        when the id is valid but there is a stock of more then 0
  DELETE /show/5dc1988dc5d8f677a0378bb6/ 200 0.972 ms - 44
          √ should return an error message
      PUT /show/:id/purchase
        when the id is valid
  PUT /show/5dc1988dc5d8f677a0378bb9/purchase 200 2.842 ms - 145
          √ it should return the message and should reduce the stock by 1
        when the id is invalid
  GET /show/999999 200 0.468 ms - 226
          √ should return an error message
  
    Movies
      GET /movie
  GET /movie 200 1.775 ms - 562
        √ should GET all movies
      GET /movie/id
        when the id is valid
  GET /movie/5dc1988ec5d8f677a0378bc2 200 1.608 ms - 186
          √ should return the matching movie ID
        when the id is invalid
  GET /movie/9919191 200 0.607 ms - 230
          √ should return the not found message
      POST /movie
  POST /movie 200 3.055 ms - 131
        √ should return conformation message and update the datastore
      PUT /movie/:id/purchase
        when the id is valid
  PUT /movie/5dc1988ec5d8f677a0378bcc/purchase 200 2.317 ms - 136
          √ it should return the message and should reduce the stock by 1
        when the id is invalid
  PUT /movie/999999/purchase 200 0.369 ms - 29
          √ should return an error message
      DELETE /movie/:id
        when the id is valid and stock is 0
  DELETE /movie/5dc1988ec5d8f677a0378bd4/ 200 2.219 ms - 40
          √ should DELETE the matching movie
        when the id is invalid
  DELETE /movie/999999/ 200 0.385 ms - 29
          √ should return an eror saying invalid
        when the id is valid but there is a stock of more then 0
          √ should return an error message
  
  
    29 passing (2s)
~~~



## Extra features.




[datamodel]: ./img/data.jpg