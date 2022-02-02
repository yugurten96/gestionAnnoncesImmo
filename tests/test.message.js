var should = require("should");
var mongoose = require('mongoose');
var Message = require("../models/message.js");

describe('Message', function() {

    before(async () => {
        await mongoose.connect('mongodb://127.0.0.1/essai');
        done();
    });

    after(async () => {
        await mongoose.connection.close();
        done();
    });

    beforeEach(function(done) {
        var message = new Message({
            text: "Dans quelle ville ?",
            replies: [{text:'Metz'}],
            author: {username:'Max'}
        });

        message.save(function(error) {
            if (error) console.log('error' + error.message);
            else console.log('no error');
            done();
        });
    });

    it('find message by text', function(done) {
        Message.findOne({ text: "Dans quelle ville ?" }, function(err, message) {
            message.replies[0].text.should.eql("Metz");
            console.log("replies[0].text: ", message.replies[0].text);
            done();
        });
    });

    afterEach(function(done) {
        Review.remove({}, function() {
            done();
        });
    });

});
