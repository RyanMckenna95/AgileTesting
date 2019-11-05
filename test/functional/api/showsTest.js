const expect = require("chai").expect
const express = require("express")
const {MongoMemoryServer} = require("mongodb-memory-server")
const request = require("supertest")
const mongoose = require("mongoose")
const _ = require("lodash")
const Show = require("../../../models/shows")
const after = require("lodash")

let server
let mongod
let db, validID, validID2 , stockemp, stock

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
      await Show.deleteMany({})
      let show = new Show()
      show.title = "House"
      show.season = 3
      show.released = "2005"
      show.cost = 24
      show.stock = 100
      await show.save()
      show = new Show()
      show.title = "The boys"
      show.season = 1
      show.released = "2019"
      show.cost = 10
      show.stock = 1765
      await show.save()
      let showNoStock = new Show()
      showNoStock.title = "firefly"
      showNoStock.season = 2
      showNoStock.released = "2009"
      showNoStock.cost = 15
      showNoStock.stock = 0
      await showNoStock.save()
      show = await Show.findOne({title: "House"})
      validID = show._id
      stock = show.stock
      showNoStock = await Show.findOne({title: "firefly"})
      validID2 = showNoStock._id
      stockemp = showNoStock.stock
    } catch (error) {
      console.log(error)
    }
  })

  describe("GET /show", () => {
    it("should GET all shows", done => {
      request(server)
        .get("/show")
        .set("Accept", "application/json")
        .expect("Content-type", /json/)
        .expect(200)
        .end((err, res) => {
          try {
            expect(res.body).to.be.a("array")
            expect(res.body.length).to.equal(3)
            expect(res.body[0]).to.have.property("title", "House")
            expect(res.body[0]).to.have.property("season", 3)
            expect(res.body[0]).to.have.property("released", "2005")
            expect(res.body[0]).to.have.property("cost", 24)
            expect(res.body[0]).to.have.property("stock", 100)
            expect(res.body[1]).to.have.property("title", "The boys")
            expect(res.body[1]).to.have.property("season", 1)
            expect(res.body[1]).to.have.property("released", "2019")
            expect(res.body[1]).to.have.property("cost", 10)
            expect(res.body[1]).to.have.property("stock", 1765)
            expect(res.body[2]).to.have.property("title", "firefly")
            expect(res.body[2]).to.have.property("season", 2)
            expect(res.body[2]).to.have.property("released", "2009")
            expect(res.body[2]).to.have.property("cost", 15)
            expect(res.body[2]).to.have.property("stock", 0)
            done()
          } catch (e) {
            done(e)
          }
        })
    })
  })

  describe("GET /show/id", () => {
    describe("when the id is valid", () => {
      it("should return the matching show ID", done => {
        request(server)
          .get(`/show/${validID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body[0]).to.have.property("title", "House")
            expect(res.body[0]).to.have.property("season", 3)
            expect(res.body[0]).to.have.property("released", "2005")
            expect(res.body[0]).to.have.property("cost", 24)
            expect(res.body[0]).to.have.property("stock", 100)
            done(err)
          })
      })
    })
    describe("when the id is invalid", () => {
      it("should return the not found message", done => {
        request(server)
          .get("/show/9919191")
          .set("Accept", "application/json")
          .expect("Content-type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).equals("show not found")
            done(err)
          })
      })
    })
  })

  describe("POST /show", () => {
    it("should return conformation message and update the datastore", () => {
      const movie = {
        title: "Vinland",
        season: 1,
        released: "2019",
        cost: 19,
        stock: 1221
      }
      return request(server)
        .post("/show")
        .send(movie)
        .expect(200)
        .then(res => {
          expect(res.body.message).equals("show added successfully")
          validID = res.body.data._id
        })
    })
    after(() => {
      return request(server)
        .get(`/show/${validID}`)
        .expect(200)
        .then(res => {
          expect(res.body[0]).to.have.property("title", "Vinland")
          expect(res.body[0]).to.have.property("season", 1)
          expect(res.body[0]).to.have.property("released", "2019")
          expect(res.body[0]).to.have.property("cost", 19)
          expect(res.body[0]).to.have.property("stock", 1221)
        })
    })
  })

  describe("PUT /show/:id/purchase", () => {
    describe("when the id is valid", () => {
      it("it should return the message and should reduce the stock by 1", () => {
        return request(server)
          .put(`/show/${validID}/purchase`)
          .expect(200)
          .then(resp => {
            expect(resp.body).to.include({message: "added to basket"})
            expect(resp.body.data).to.have.property("stock", 99)

          })
      })

      after(() => {
        return request(server)
          .get(`/show/${validID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then(resp => {
            expect(resp.body[0]).to.have.property("stock", 99)
          })
      })
    })
    describe("when the id is invalid", () => {
      it("should return an error message", done => {
        request(server)
          .get("/show/999999")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).to.equal("show not found")
            done(err)
          })
      })
    })
  })

  describe("DELETE /show/:id", () => {
    describe("when the id is valid and stock is 0", () => {
      it("should DELETE the matching movie", done => {
        request(server)
          .delete(`/show/${validID2}/`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).equals("show deleted Successfully")
            done(err)
          })

      })
    })
    describe("when the id is invalid",  () => {
      it("should return an error saying invalid", done => {
        request(server)
          .delete("/show/999999/")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err,res) => {
            expect(res.body.message).equals("show not found")
            done(err)
          })
      })
    })
    describe("when the id is valid but there is a stock of more then 0", () => {
      it("should return an error message", () => {
        request(server)
          .delete(`/show/${validID}/`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err,res) => {
            expect(res.body.message).equals("must be out of stock to delete")
          })
      })
    })

  })
})