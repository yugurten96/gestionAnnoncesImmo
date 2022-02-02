const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const app = require("../app");
let should = chai.should();

describe("Gets all annonces", () => {
  // Tests
  it("Returns all annonces", done => {
    request(app)
        .post("/graphql")
        .send({
          query: "{ annonces {id name description price createdAt type status} }"
        })
        .expect(200)
        .end((err, res) => {
          res.status.should.be.equal(200);
          res.body.data.annonces.should.be.a("array");
          //res.body.data.posts.should.have.property("id");
          done();
        });
  });
});



describe("Create annonce", () => {
  // Tests
  it("Returns an error message", done => {
    request(app)
        .post("/api")
        .send({
          mutation:
              '{createAnnonce(annonceInput: {name:"should work", description: " i hope this works ", price: 500, type: "Location"})}'
        })
        .expect(200)
        .end((err, res) => {
          res.status.should.be.equal(400);
          expect(res.body).to.have.nested.property("errors[0].message");
          done();
        });
  });
});

describe("Review an annonce", () => {
  // Tests
  it("Returns an authentification error message", done => {
    request(app)
        .post("/graphql")
        .send({
          mutation:
              '{ review(id: "5de44ffe36d19042cc2af445", rating: 5, text: "it is a beautiful house")}'
        })
        .expect(200)
        .end((err, res) => {
          res.status.should.be.equal(400);
          expect(res.body).to.have.nested.property("errors[0].message");
          done();
        });
  });
});


describe("Comment on an annonce", () => {
  // Tests
  it("Returns an authentification error message", done => {
    request(app)
        .post("/api")
        .send({
          mutation:
              '{AddComment(annonce_id="5de44ffe36d19042cc2af445",text:"So beautiful")}'
        })
        .expect(200)
        .end((err, res) => {
          res.status.should.be.equal(400);
          expect(res.body).to.have.nested.property("errors[0].message");
          done();
        });
  });
});

describe("Message annonce owner", () => {
  // Tests
  it("Returns an authentification error message", done => {
    request(app)
        .post("/graphql")
        .send({
          mutation:
              '{ AddMessage(annonce_id: "5de44ffe36d19042cc2af445", text: "Is it available ?")}'
        })
        .expect(200)
        .end((err, res) => {
          res.status.should.be.equal(400);
          expect(res.body).to.have.nested.property("errors[0].message");
          done();
        });
  });
});

describe("Reply to a message", () => {
  // Tests
  it("Returns an authentification error message", done => {
    request(app)
        .post("/gaphql")
        .send({
          mutation:
              '{ addReply(annonce_id: "5de44ffe36d19042cc2af445", message_id: "5de4f12f17efd90e8c039ae8", : text: "message received")}'
        })
        .expect(200)
        .end((err, res) => {
          res.status.should.be.equal(400);
          expect(res.body).to.have.nested.property("errors[0].message");
          done();
        });
  });
});