var mongoose = require('mongoose');
var User = require("../models/user.js");

var request = require('supertest');
var app = require('../app');
var agent = request.agent(app);

describe('Compte', function() {

    before(async () => {
        await mongoose.connect('mongodb://127.0.0.1/essai');
        User.register(
            new User({
                username:'max',
                firstname: 'Max',
                lastname: 'Smith',
                email: 'az@az.az',
                role: 'utilisateur'

            }), 'az', function(err, user) {}
        );
        done();
    });

    after(async () => {
        await mongoose.connection.close();
        done();
    });


    it('creer compte', function(done) {
        agent.post('/login')
            .send({ email: 'az@az.az', password: 'az' })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    it('creer annonce', function(done) {
        agent.get('annonces/new')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                done();
            });
    });

});
