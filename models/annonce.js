const mongoose = require('mongoose');

// Schema Setup
var annonceSchema = new mongoose.Schema({
    name: String,
    price: Number,
    type: String,
    status: String,
    publication: String,
    image: [String],
    imageId: [String],
    location: String,
    description: String,
    availability: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        firstname: String,
        lastname: String,
        role: String
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Annonce", annonceSchema);
