const { GraphQLList, GraphQLID } = require("graphql")
const { UserType, AnnonceType, CommentType, MessageType, ReplyType, ReviewType } = require("./types")

const User= require("../models/user");
const Annonce= require("../models/annonce");
const Comment= require("../models/comment");
const Message= require("../models/message");
const Reply= require("../models/reply");
const Review= require("../models/review");


const users = {
    type: new GraphQLList(UserType),
    description: "Retrieves list of users",
    resolve() {
        return User.find()
    },
}

const user = {
    type: UserType,
    description: "Retrieves one user",
    args: { id: { type: GraphQLID } },

    resolve(_, args) {
        return User.findById(args.id)
    },
}

const annonces = {
    type: new GraphQLList(AnnonceType),
    description: "Retrieves list of annonces",
    resolve() {
        return Annonce.find()
    },
}

const annonce = {
    type: AnnonceType,
    description: "Retrieves one annonce",
    args: { id: { type: GraphQLID } },
    resolve(_, args) {
        return Annonce.findById(args.id)
    },
}
const comments = {
    type: new GraphQLList(CommentType),
    description: "Retrieves list of comments",
    resolve() {
        return Comment.find()
    },
}

const comment = {
    type: CommentType,
    description: "Retrieves one comment",
    args: { id: { type: GraphQLID } },
    resolve(_, args) {
        return Comment.findById(args.id)
    },
}

const messages = {
    type: new GraphQLList(MessageType),
    description: "Retrieves list of messages",
    resolve() {
        return Message.find()
    },
}

const message = {
    type: MessageType,
    description: "Retrieves one message",
    args: { id: { type: GraphQLID } },
    resolve(_, args) {
        return Message.findById(args.id)
    },
}

const replies = {
    type: new GraphQLList(ReplyType),
    description: "Retrieves list of replies",
    resolve() {
        return Reply.find()
    },
}

const reply = {
    type: ReplyType,
    description: "Retrieves one reply",
    args: { id: { type: GraphQLID } },
    resolve(_, args) {
        return Reply.findById(args.id)
    },
}

const reviews = {
    type: new GraphQLList(ReviewType),
    description: "Retrieves list of reviews",
    resolve() {
        return Reply.find()
    },
}

const review = {
    type: ReviewType,
    description: "Retrieves one review",
    args: { id: { type: GraphQLID } },
    resolve(_, args) {
        return Review.findById(args.id)
    },
}

module.exports = { users, user, annonces, annonce, comments, comment, messages, message, replies, reply, reviews, review }
