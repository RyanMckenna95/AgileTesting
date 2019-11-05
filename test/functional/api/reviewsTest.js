const expect = require("chai").expect
const express = require("express")
const {MongoMemoryServer} = require("mongodb-memory-server")
const request = require("supertest")
const mongoose = require("mongoose")
const _ = require("lodash")
const Review = require("../../../models/reviews")
const after = require("lodash")

let server
let mongod
let db, validID, movieID

describe("Shows", ()=> {
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
            await Review.deleteMany({})
            let review = new Review()
            review.author = "Joe Johnson"
            review.titleID = "1222"
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
                        expect(res.body[0]).to.have.property("titleID", "1222")
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
                        expect(res.body[0]).to.have.property("titleID", "1222")
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
})