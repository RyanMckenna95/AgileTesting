
let express = require('express');
let mongoose = require('mongoose');
let router = express.Router();
var Review = require('../models/reviews')
var Movie =require('../models/movies')

//var mongodbUri = 'mongodb+srv://moviedb:movielover123@movielovers-lm3w3.mongodb.net/test?retryWrites=true&w=majority'
//mongoose.connect('mongodb://localhost:27017/movieLoverdbs');
const connectionString= "mongodb://localhost:27017/movieLoverdbs";
mongoose.connect(connectionString);

router.findAllReviews =(req, res) => {

    res.setHeader('Content-Type', 'application/json');

    Review.find(function (err, reviews) {
        if (err)
            res.send(err);

        res.send(JSON.stringify(reviews, null, 5));
    })
}


function getByValue(array, id) {
    var result  = array.filter(function(obj){return obj.id == id;} );
    return result ? result[0] : null; // or undefined
}

router.findOneByID = (req, res) => {

    res.setHeader('Content-type','application/json');

    Review.find({"_id":req.params.id},function (err, review) {
        if(err)
            res.json({message: 'Review not found', errmsg:err});
        else
            res.send(JSON.stringify(review,null,5));
    });
}

function getByName(array, title) {
    var result  = array.filter(function(obj){return obj.title == title;} );
    return result ? result[0] : null; // or undefined
}

router.addReviewMovie = (req, res) => {
    res.setHeader('Content-type','application/json');

    Movie.findOne({'_id': req.params.id}, function (err) {
        if(err)
            res.json({message: 'movie not found'})
        else
            var review = new Review

            review.author= req.body.author;
            review.titleID= req.params.id;
            review.reviewedTitle= req.body.reviewedTitle;
            review.review= req.body.review;
            review.rating= req.body.rating;
        review.save(function (err) {
            if(err)
                res.json({message:'review not added',errmsg:err});
            else
                res.json({message:'review added successfully',data:review});
        });
    });

}

router.findByAuthor = (req, res)=>{
    res.setHeader('Content-type','application/json');

    Review.find({"author":req.params.author},function (err, review) {
        if(err)
            res.json({message: 'Review not found', errmsg:err});
        else
            res.send(JSON.stringify(review,null,5));
    });

}

 router.editReview =(req, res) => {
    Review.findByIdAndUpdate({_id:req.params.id},req.body).then(function(){
        Review.findOne({_id:req.params.id}).then(function(review){
            res.send(review);
        });
    });


}

router.likeReview = (req, res) => {
    Review.findById(req.params.id, function (err, review) {
        if (err)
            res.json({message: 'Review not found', errmsg: err});
        else {
            review.likes += 1;
            review.save(function (err) {
                if (err)
                    res.json({message: 'Error liking', errmsg: err});
                else
                    res.json({message: 'Review liked'});

            });
        }

    });
}

router.deleteReview = (req, res) => {

    Review.findByIdAndRemove(req.params.id,function (err) {
        if(err)
            res.json({message:'Review not deleted',errmsg:err});
        else
            res.json({message:'Review has been deleted'});

    });

}

module.exports=router;