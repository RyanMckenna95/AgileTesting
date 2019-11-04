const expect = require("chai").expect;
const express = require('express');
const {MongoMemoryServer} = require("mongodb-memory-server");
const request = require("supertest");
const mongoose = require("mongoose");
const _ = require("lodash");
 const Movie = require("../../../models/movies");
const after = require("lodash");

let server;
let mongod;
let db, validID, validID2 , stockemp, stock;

describe('Movies', ()=> {
    before(async () => {
        try {
            mongod = new MongoMemoryServer();
            // Async Trick - this ensures the database is created before
            // we try to connect to it or start the server
            const connString = await mongod.getConnectionString();

            await mongoose.connect(connString, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            server = require("../../../bin/www");
            db = mongoose.connection;
        } catch (error) {
            console.log(error);
        }
    });

    after(async () => {
        try {
            await db.dropDatabase();
            await mongod.stop();
            await server.close();
        } catch (error) {
            console.log(error)
        }
    });

    beforeEach(async () => {
        try {
            await Movie.deleteMany({});
            let movie = new Movie();
            movie.title = "Avatar";
            movie.released = "2012";
            movie.cost = 24;
            movie.stock = 133;
            await movie.save();
            movie = new Movie();
            movie.title = "World war z";
            movie.released = "2013";
            movie.cost = 12;
            movie.stock = 1765;
            await movie.save();
            let movieNoStock = new Movie();
            movieNoStock.title = "Green book";
            movieNoStock.released = "2018";
            movieNoStock.cost = 10;
            movieNoStock.stock = 0;
            await movieNoStock.save();
            movie = await Movie.findOne({title: "Avatar"});
            validID = movie._id;
            stock = movie.stock;
            movieNoStock = await Movie.findOne({title: "Green book"});
            validID2 = movieNoStock._id;
            stockemp = movieNoStock.stock;
        } catch (error) {
            console.log(error);
        }
    });

    describe("GET /movie", () => {
        it("should GET all movies", done => {
            request(server)
                .get("/movie")
                .set("Accept", "application/json")
                .expect("Content-type", /json/)
                .expect(200)
                .end((err, res) => {
                    try {
                        expect(res.body).to.be.a("array");
                        expect(res.body.length).to.equal(3);
                        expect(res.body[0]).to.have.property("title", "Avatar");
                        expect(res.body[0]).to.have.property("released", "2012");
                        expect(res.body[0]).to.have.property("cost", 24);
                        expect(res.body[0]).to.have.property("stock", 133);
                        expect(res.body[1]).to.have.property("title", "World war z");
                        expect(res.body[1]).to.have.property("released", "2013");
                        expect(res.body[1]).to.have.property("cost", 12);
                        expect(res.body[1]).to.have.property("stock", 1765);
                        expect(res.body[2]).to.have.property("title", "Green book");
                        expect(res.body[2]).to.have.property("released", "2018");
                        expect(res.body[2]).to.have.property("cost", 10);
                        expect(res.body[2]).to.have.property("stock", 0);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });
    });

    describe("GET /movie/id", () => {
        describe("when the id is valid", () => {
            it("should return the matching movie ID", done => {
                request(server)
                    .get(`/movie/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body[0]).to.have.property("title", "Avatar");
                        expect(res.body[0]).to.have.property("released", "2012");
                        expect(res.body[0]).to.have.property("cost", 24);
                        expect(res.body[0]).to.have.property("stock", 133);
                        done(err);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return the not found message", done => {
                request(server)
                    .get("/movie/9919191")
                    .set("Accept", "application/json")
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.message).equals('Movie not found');
                        done(err);
                    });
            });
        });
    });

    describe("POST /movie", () => {
        it("should return conformation message and update the datastore", () => {
            const movie = {
                title: "Shrek",
                released: "2003",
                cost: 10,
                stock: 111
            };
            return request(server)
                .post("/movie")
                .send(movie)
                .expect(200)
                .then(res => {
                    expect(res.body.message).equals("Movie added");
                    validID = res.body.data._id;
                });
        });
        after(() => {
            return request(server)
                .get(`/movie/${validID}`)
                .expect(200)
                .then(res => {
                    expect(res.body[0]).to.have.property("title", "Shrek");
                    expect(res.body[0]).to.have.property("released", "2003");
                    expect(res.body[0]).to.have.property("cost", 10);
                    expect(res.body[0]).to.have.property("stock", 111);
                });
        });
    });


    describe("PUT /movie/:id/purchase", () => {
        describe("when the id is valid", () => {
            it("it should return the message and should reduce the stock by 1", () => {
                return request(server)
                    .put(`/movie/${validID}/purchase`)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body).to.include({message: "added to basket"});
                        expect(resp.body.data).to.have.property("stock", 132);

                    });
            });

            after(() => {
                return request(server)
                    .get(`/movie/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body[0]).to.have.property("stock", 132);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return an error message", done => {
                 request(server)
                    .get(`/movie/999999`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.message).to.equal("Movie not found");
                        done(err);
                    });
            });
        });
    });


    describe("DELETE /movie/:id", () => {
        describe("when the id is valid and stock is 0", () => {
            it("should DELETE the matching movie", done => {
                request(server)
                    .delete(`/movie/${validID2}/`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.message).equals("movie deleted Successfully");
                        done(err);
                    });

            });
        });
        describe("when the id is invalid",  () => {
            it("should return an eror saying invalid", done => {
                request(server)
                    .delete(`/movie/999999/`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err,res) => {
                        expect(res.body.message).equals("Movie not found");
                        done(err);
                    });
            });
        });
        describe("when the id is valid but there is a stock of more then 0", () => {
             it("should return an error message", () => {
                   request(server)
                       .delete(`/movie/${validID}/`)
                       .set("Accept", "application/json")
                       .expect("Content-Type", /json/)
                       .expect(200)
                       .end((err,res) => {
                           expect(res.body.message).equals("must be out of stock to delete");
                       });
                });
          });

    });
});