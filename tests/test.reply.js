var should = require("should");
var mongoose = require('mongoose');
var Reply = require("../models/reply.js");

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
        var reply = new Reply({
            text: "Metz",
            author: {username: 'Max'}

        });

        reply.save(function(error) {
            if (error) console.log('error' + error.message);
            else console.log('no error');
            done();
        });
    });

    it('find reply by text', function(done) {
        Reply.findOne({ text: "Metz" }, function(err, reply) {
            Reply.text.should.eql("Metz");
            console.log("reply.text: ", reply.text);
            done();
        });
    });

    afterEach(function(done) {
        Reply.remove({}, function() {
            done();
        });
    });

});
