let movies = require('../models/movies');
let express = require('express');
let mongoose = require('mongoose');
let router = express.Router();
var Movie= require('../models/movies');


//var mongodbUri = 'mongodb+srv://moviedb:movielover123@movielovers-lm3w3.mongodb.net/test?retryWrites=true&w=majority'

const connectionString= "mongodb://localhost:27017/movieLoverdbs";
mongoose.connect(connectionString);

let db = mongoose.connection;

db.on('error', function (err) {
    console.log('Unable to Connect to [ ' + db.name + ' ]', err);
});

db.once('open', function () {
    console.log('Successfully Connected to [ ' + db.name + ' ]');
});

router.findAllMovies =(req, res) =>{

    res.setHeader('Content-Type', 'application/json');

    Movie.find(function (err, movies) {
        if(err)
            res.send(err);

        res.send(JSON.stringify(movies,null,5));
    })

}

function getByValue(array, id) {
    var result  = array.filter(function(obj){return obj.id == id;} );
    return result ? result[0] : null; // or undefined
}

router.findOneByID = (req, res) => {

    res.setHeader('Content-type','application/json');

    Movie.find({"_id":req.params.id},function (err, movie) {
        if(err)
        res.json({message: 'Movie not found', errmsg:err});
        else
            res.send(JSON.stringify(movie,null,5));
    });
}

router.addMovie = (req, res) => {

    res.setHeader('Content-type','application/json');

    var movie = new Movie;

    movie.title=req.body.title;
    movie.released=req.body.released;
    movie.cost=req.body.cost;
    movie.stock=req.body.stock;

    movie.save(function (err) {
        if(err)
            res.json({message: 'Movie not added', errmsg:err});

        else
        res.json({message: 'Movie added', data:movie});
    });

}

router.purchaseMovie = (req, res) => {

    let stock;

    Movie.findById({"_id": req.params.id},function (err,movie) {
        if (err)
            res.json({message: "Movie not found"});
        else {

            stock = movie.stock;
            if (stock = 0) {
                res.json({message: 'this Movie is out of stock', errmsg: err});
            } else
                movie.stock -= 1;
                movie.save(function (err) {

                if (err)
                    res.json({message: 'unable to add to checkout', errmsg: err});
                else
                    res.json({message: 'added to basket', data: movie});
            });
        }
    });
}

router.deleteMovie = (req, res) => {
    let stock;



    Movie.findById({"_id": req.params.id}, function (err, movie) {
        if (err)
            res.json({message: "Movie not found"});
        else {
            stock = movie.stock;
            if(stock = 0){
                res.send('must be out of stock to delete');
            }else
            Movie.findByIdAndRemove(req.params.id, function (err) {
                if(err)
                    res.json({message:'Movie not deleted',errmsg:err});
                else
                    res.json({message:"movie deleted Successfully"})
            })
        }

    });



};

module.exports=router;