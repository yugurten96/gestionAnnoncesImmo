var should = require("should");
var mongoose = require('mongoose');
var Comment = require("../models/comment.js");

describe('Comment', function() {

    before(async () => {
        await mongoose.connect('mongodb://127.0.0.1/essai');
        done();
    });

    after(async () => {
        await mongoose.connection.close();
        done();
    });

    beforeEach(function(done) {
        var comment = new Comment({
            text: "Une très belle maison",
            author: {username: 'Max'}

        });

        comment.save(function(error) {
            if (error) console.log('error' + error.message);
            else console.log('no error');
            done();
        });
    });

    it('find comment by text', function(done) {
        Comment.findOne({ text: "Une très belle maison" }, function(err, comment) {
            comment.text.should.eql("Une très belle maison");
            console.log("comment.text: ", comment.text);
            done();
        });
    });

    afterEach(function(done) {
        Comment.remove({}, function() {
            done();
        });
    });

});
