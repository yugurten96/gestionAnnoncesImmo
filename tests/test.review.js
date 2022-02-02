var should = require("should");
var mongoose = require('mongoose');
var Review = require("../models/review.js");

describe('Review', function() {

    before(async () => {
        await mongoose.connect('mongodb://127.0.0.1/essai');
        done();
    });

    after(async () => {
        await mongoose.connection.close();
        done();
    });

    beforeEach(function(done) {
        var review = new Review({
            rating: 5,
            text: "Très beau appartement !",
            author: {username: 'Max'},
            annonce: {name: 'Appartement'}
        });

        review.save(function(error) {
            if (error) console.log('error' + error.message);
            else console.log('no error');
            done();
        });
    });

    it('find review by text', function(done) {
        review.findOne({ text: "Très beau appartement !" }, function(err, review) {
            review.annonce.name.should.eql("Appartement");
            console.log("annonce.name: ", annonce.name);
            done();
        });
    });

    afterEach(function(done) {
        Review.remove({}, function() {
            done();
        });
    });

});
