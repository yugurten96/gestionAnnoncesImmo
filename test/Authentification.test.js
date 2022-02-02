const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const app = require("../app");
let should = chai.should();

describe("login", () => {
  // Tests
  it("Logs in and returns a token", done => {
    request(app)
        .post("/graphql")
        .send({
          query: '{ login(username: "admin", password: "admin", role:"admin") { token } }'
        })
        .expect(200)
        .end((err, res) => {
          res.status.should.be.equal(200);
          res.body.data.login.should.have.property("token");
          //res.body.data.annonces.should.have.property("id");
          done();
        });
  });
});

describe("Login", () => {
  // Tests
  it("Returns an error message", done => {
    request(app)
        .post("/graphql")
        .send({
          query:
              '{ login(username: "wrong user", password: "wrong password") { token } }'
        })
        .expect(200)
        .end((err, res) => {
          res.status.should.be.equal(200);
          expect(res.body).to.have.nested.property("errors[0].message");
          done();
        });
  });
});

describe("register", () => {
  // Tests
  it("Should return a 'user already exists' message", done => {
    request(app)
        .post("/graphql")
        .send({
          mutation:
              '{ addUser(addUser: {username:"max", firstname: " max " ,lastname: " braver ", email: "maxybraver@gmail.com", password: "max", role: "admin"}) }'
        })
        .expect(200)
        .end((err, res) => {
          res.status.should.be.equal(400);
          expect(res.body).to.have.nested.property("errors[0].message");
          //res.body.data.annonces.should.have.property("id");
          done();
        });
  });
});