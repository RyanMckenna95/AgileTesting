const expect = require("chai").expect
const {MongoMemoryServer} = require("mongodb-memory-server")
const request = require("supertest")
const mongoose = require("mongoose")
const Review = require("../../../models/reviews")
const Movie = require("../../../models/movies")
const after = require("lodash")

let server
let mongod
let db, validID, movieID, valAuthor

describe("Reviews", ()=> {
  before(async () => {
    try {
      mongod = new MongoMemoryServer()
      // Async Trick - this ensures the database is created before
      // we try to connect to it or start the server
      const connString = await mongod.getConnectionString()

      await mongoose.connect(connString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      server = require("../../../bin/www")
      db = mongoose.connection
    } catch (error) {
      console.log(error)
    }
  })
  after(async () => {
    try {
      await db.dropDatabase()
      await mongod.stop()
      await server.close()
    } catch (error) {
      console.log(error)
    }
  })
  beforeEach(async () => {
    try {
      await Movie.deleteMany({})
      let movie = new Movie()
      movie.title = "Avatar"
      movie.released = "2012"
      movie.cost = 24
      movie.stock = 133
      await movie.save()
      movie = await Movie.findOne({title:"Avatar"})
      movieID = movie._id
      await Review.deleteMany({})
      let review = new Review()
      review.author = "Joe Johnson"
      review.titleID = `${movieID}`
      review.reviewedTitle = "Avatar"
      review.review = "mater piece"
      review.rating = 8
      review.likes = 1
      await review.save()
      review = new Review()
      review.author = "Ron Bobby"
      review.titleID = "2232"
      review.reviewedTitle = "World war z"
      review.review = "Average"
      review.rating = 5
      review.likes = 21
      await review.save()

      review = new Review()
      review.author = "Ron Bobby"
      review.titleID = "3343"
      review.reviewedTitle = "Green book"
      review.review = "Oscars in its future"
      review.rating = 9
      review.likes = 44
      await review.save()
      review = await Review.findOne({reviewedTitle: "Avatar"})
      validID = review._id
      movieID = review.titleID
      valAuthor = review.author
    } catch (error) {
      console.log(error)
    }
  })

  describe("GET /review", () => {
    it("should GET all reviews", done => {
      request(server)
        .get("/review")
        .set("Accept", "application/json")
        .expect("Content-type", /json/)
        .expect(200)
        .end((err, res) => {
          try {
            expect(res.body).to.be.a("array")
            expect(res.body.length).to.equal(3)
            expect(res.body[0]).to.have.property("author", "Joe Johnson")
            expect(res.body[0]).to.have.property("titleID", `${movieID}`)
            expect(res.body[0]).to.have.property("reviewedTitle", "Avatar")
            expect(res.body[0]).to.have.property("review", "mater piece")
            expect(res.body[0]).to.have.property("rating", 8)
            expect(res.body[0]).to.have.property("likes", 1)
            expect(res.body[1]).to.have.property("author", "Ron Bobby")
            expect(res.body[1]).to.have.property("titleID", "2232")
            expect(res.body[1]).to.have.property("reviewedTitle", "World war z")
            expect(res.body[1]).to.have.property("review", "Average")
            expect(res.body[1]).to.have.property("rating", 5)
            expect(res.body[1]).to.have.property("likes", 21)
            expect(res.body[2]).to.have.property("author", "Ron Bobby")
            expect(res.body[2]).to.have.property("titleID", "3343")
            expect(res.body[2]).to.have.property("reviewedTitle", "Green book")
            expect(res.body[2]).to.have.property("review", "Oscars in its future")
            expect(res.body[2]).to.have.property("rating", 9)
            expect(res.body[2]).to.have.property("likes", 44)
            done()
          } catch (e) {
            done(e)
          }
        })
    })
  })

  describe("GET /review/id", () => {
    describe("when the id is valid", () => {
      it("should return the matching review ID", done => {
        request(server)
          .get(`/review/${validID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body[0]).to.have.property("author", "Joe Johnson")
            expect(res.body[0]).to.have.property("titleID", `${movieID}`)
            expect(res.body[0]).to.have.property("reviewedTitle", "Avatar")
            expect(res.body[0]).to.have.property("review", "mater piece")
            expect(res.body[0]).to.have.property("rating", 8)
            expect(res.body[0]).to.have.property("likes", 1)
            done(err)
          })
      })
    })
    describe("when the id is invalid", () => {
      it("should return the not found message", done => {
        request(server)
          .get("/review/9919191")
          .set("Accept", "application/json")
          .expect("Content-type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).equals("Review not found")
            done(err)
          })
      })
    })
  })

  describe("GET /review/:author", () => {
    describe("when the author is valid", () => {
      it("should return reviews matching the author", done => {
        request(server)
          .get(`/review/author/${valAuthor}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body[0]).to.have.property("author", "Joe Johnson")
            expect(res.body[0]).to.have.property("titleID", `${movieID}`)
            expect(res.body[0]).to.have.property("reviewedTitle", "Avatar")
            expect(res.body[0]).to.have.property("review", "mater piece")
            expect(res.body[0]).to.have.property("rating", 8)
            expect(res.body[0]).to.have.property("likes", 1)
            done(err)
          })
      })
    })
    describe("when the author is not valid name", () => {
      it("should return the not found message", done => {
        request(server)
          .get("/review/author/tom cory")
          .set("Accept", "application/json")
          .expect("Content-type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal("review not found")
            done(err)
          })
      })
    })
  })
  describe("POST /review/write/:id", () => {
    describe("when the movie id is valid", () => {
      it("should add the review", () => {
        const review = {
          author: "Ryan Mckenna",
          titleID: `${movieID}`,
          reviewedTitle: "Avatar",
          review: "aged badly",
          rating: 4
        }
        request(server)
          .post(`/review/write/${movieID}`)
          .send(review)
          .expect(200)
          .then(res => {
            expect(res.body.message).equals("review added successfully")
            validID= res.body.data._id
          })
      })
      after(() => {
        return request(server)
          .get(`/review/${validID}`)
          .expect(200)
          .then(res => {
            expect(res.body[0]).to.have.property("author", "Ryan Mckenna")
            expect(res.body[0]).to.have.property("titleID", `${movieID}`)
            expect(res.body[0]).to.have.property("reviewedTitle", "Avatar")
            expect(res.body[0]).to.have.property("review", "aged badly")
            expect(res.body[0]).to.have.property("rating", 4)
            expect(res.body[0]).to.have.property("likes", 0)
          })
      })
      // describe("if the movieID is invalid", () => {
      //     it("should return an error message", () => {
      //           const review = {
      //              author: "Ryan Mckenna",
      //               titleID: "12322",
      //                reviewedTitle: "Avatar",
      //               review: "aged badly",
      //               rating: 4
      //           }
      //         request(server)
      //             .post("/review/write/11111")
      //             .send(review)
      //             .expect(200)
      //             .then( res => {
      //                 expect(res.body.message).equals('movie not found')
      //
      //             })
      //     })
      // })
    })
  })

  describe("PUT /review/:id/like", () => {
    describe("when the id is valid", () => {
      it("should add a like to the review", () => {
        request(server)
          .put(`/review/${validID}/like`)
          .expect(200)
          .then(resp => {
            expect(resp.body).to.include({
              message: "Review liked"
            })
            expect(resp.body.data).to.have.property("likes",2)
          })
      })
      after(() => {
        request(server)
          .get(`/review/${validID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expact(200)
          .then(resp => {
            expect(resp.body[0]).to.have.property("upvotes",2)
          })
      })
      describe("when the id is invalid", () => {
        it("should error message saying not found", done => {
          request(server)
            .put("/review/111111111/like")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .end((err, res) => {
              expect(res.body.message).to.equal("Review not found")
              done(err)
            })
        })
      })
    })
  })
  describe("DELETE /review/:id", () => {
    describe("when the id is valid", ()=> {
      it("should DELETE the matching review", done => {
        request(server)
          .delete(`/review/${validID}/`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).equals("Review has been deleted")
            done(err)
          })
      })
    })
    describe("when the id is invalid",  () => {
      it("should return an error saying invalid", done => {
        request(server)
          .delete("/review/999999/")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err,res) => {
            expect(res.body.message).equals("Review not deleted")
            done(err)
          })
      })
    })
  })
  describe("PUT /review/edit/:id", () => {
    describe("when the id is valid", () => {
      it("should update the review", done => {
        const review = {
          review: "better"
        }
        request(server)
          .put(`/review/edit/${validID}`)
          .send(review)
          .expect(200)
        done()
      })
    })
    after(() => {
      return request(server)
        .get(`/review/${validID}`)
        .expect(200)
        .then(res => {
          expect(res.body[0]).to.have.property("author", "Ryan Mckenna")
          expect(res.body[0]).to.have.property("titleID", `${movieID}`)
          expect(res.body[0]).to.have.property("reviewedTitle", "Avatar")
          expect(res.body[0]).to.have.property("review", "better")
          expect(res.body[0]).to.have.property("rating", 4)
          expect(res.body[0]).to.have.property("likes", 0)
        })
    })
  })
})