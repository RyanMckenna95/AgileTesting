const expect = require("chai").expect;
const express = require('express');
const {MongoMemoryServer} = require("mongodb-memory-server");
const request = require("supertest");
const mongoose = require("mongoose");
const _ = require("lodash");
 const Movie = require("../../../models/movies");

let server;
let mongod;
let db, validID;

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

    beforeEach(async ()=> {
        try{
            await Movie.deleteMany({});
            let movie = new Movie();
            movie.title="Avatar";
            movie.released="2012";
            movie.cost=24;
            movie.stock=133;
            await movie.save();
            movie = new Movie();
            movie.title="World war z";
            movie.released="2013";
            movie.cost=12;
            movie.stock=1765;
            await movie.save();
            movie = await Movie.findOne({ released:"2012"});
            validID =movie._id;
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
                .end((err,res)=>{
                    try{
                        expect(res.body).to.be.a("array");
                        expect(res.body.length).to.equal(2);
                        expect(res.body[0]).to.have.property("title","Avatar");
                        expect(res.body[0]).to.have.property("released","2012");
                        expect(res.body[0]).to.have.property("cost",24);
                        expect(res.body[0]).to.have.property("stock",133);
                        expect(res.body[1]).to.have.property("title","World war z");
                        expect(res.body[1]).to.have.property("released","2013");
                        expect(res.body[1]).to.have.property("cost",12);
                        expect(res.body[1]).to.have.property("stock",1765);
                        done();
                    } catch(e){
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
                    .end((err,res)=> {
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
                    .end((err,res)=> {
                        expect(res.body.message).equals('Movie not found');
                        done(err);
                    });
            });
        });
    });

   // describe("POST /movie", () => {
        //it
    //});
});