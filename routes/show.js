let shows = require("../models/shows")
let express = require("express")
let router = express.Router()
let mongoose = require("mongoose")
let Show = require("../models/shows")

//var mongodbUri = 'mongodb+srv://moviedb:movielover123@movielovers-lm3w3.mongodb.net/test?retryWrites=true&w=majority'
//mongoose.connect('mongodb://localhost:27017/movieLoverdbs');
const connectionString= "mongodb://localhost:27017/movieLoverdbs"
mongoose.connect(connectionString)

let db = mongoose.connection

db.on("error", function (err) {
  console.log("Unable to Connect to [ " + db.name + " ]", err)
})

db.once("open", function () {
  console.log("Successfully Connected to [ " + db.name + " ]")
})

router.findAllShows =(req, res) => {

  res.setHeader("Content-Type", "application/json")

  Show.find(function (err, shows) {
    if (err)
      res.send(err)

    res.send(JSON.stringify(shows, null, 5))
  })
}


function getByValue(array, id) {
  let result  = array.filter(function(obj){return obj.id == id} )
  return result ? result[0] : null // or undefined
}

router.findOneByID = (req, res) => {

  res.setHeader("Content-type","application/json")

  Show.find({"_id":req.params.id},function (err, show) {
    if(err)
      res.json({message: "show not found", errmsg:err})
    else
      res.send(JSON.stringify(show,null,5))
  })
}

router.addShow = (req, res) => {
  res.setHeader("Content-type","application/json")

  let show = new Show

  show.title=req.body.title
  show.season=req.body.season
  show.released=req.body.released
  show.cost=req.body.cost
  show.stock=req.body.stock

  show.save(function (err) {
    if(err)
      res.json({message:"show not added",errmsg:err})
    else
      res.json({message:"show added successfully",data:show})
  })

}

router.purchaseShow = (req, res) => {

  let stock

  Show.findById({"_id": req.params.id},function (err,show) {
    if (err)
      res.json({message: "show not found"})
    else {

      stock = show.stock
      if (stock === 0) {
        res.json({message: "this Show is out of stock", errmsg: err})
      } else
        show.stock -= 1
      show.save(function (err) {

        if (err)
          res.json({message: "unable to add to checkout", errmsg: err})
        else
          res.json({message: "added to basket", data: show})
      })
    }
  })

}

router.deleteShow = (req, res) => {
  let stock



  Show.findById({"_id": req.params.id}, function (err, show) {
    if (err)
      res.json({message: "show not found"})
    else {
      stock = show.stock
      if(stock === 0){
        Show.findByIdAndRemove(req.params.id, function (err) {
          if(err)
            res.json({message:"Show not deleted",errmsg:err})
          else
            res.json({message:"show deleted Successfully"})
        })
      }else
        res.json({message:"must be out of stock to delete"})

    }

  })
}

module.exports=router