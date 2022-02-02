var should = require("should");
var mongoose = require('mongoose');
var User = require("../models/user.js");

describe('User', function() {

    before(async () => {
        await mongoose.connect('mongodb://127.0.0.1/essai');
        done();
    });

    after(async () => {
        await mongoose.connection.close();
        done();
    });

    beforeEach(function(done) {
        var user = new User({
            username: 'user',
            firstname: 'Max',
            lastname: 'Smith',
            email: 'maxsmith@gmail.fr',
            password: 'azerty',
            role: 'utilisateur'
        });

        user.save(function(error) {
            if (error) console.log('error' + error.message);
            else console.log('no error');
            done();
        });
    });

    it('find a user by username', function(done) {
        User.findOne({ email: 'maxsmith@gmail.fr' }, function(err, user) {
            user.email.should.eql('maxsmith@gmail.fr');
            console.log("email: ", user.email);
            done();
        });
    });

    afterEach(function(done) {
        User.remove({}, function() {
            done();
        });
    });

});
