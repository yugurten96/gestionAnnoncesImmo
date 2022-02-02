const {GraphQLInt} = require("graphql")
const {GraphQLDateTime} = require("graphql-iso-date/dist")
const {  UserType, AnnonceType, CommentType, MessageType, ReplyType, ReviewType } = require("./types")
const bcrypt= require("bcrypt")
const User = require("../models/user")
const Annonce = require("../models/annonce")
const Comment = require("../models/comment")
const Message = require("../models/message")
const Reply = require("../models/reply")
const Review = require("../models/review")
const {GraphQLInputObjectType} = require("graphql");
const {GraphQLID} = require("graphql");
const {GraphQLList} = require("graphql")
const {GraphQLFloat} = require("graphql")
const { GraphQLString } = require("graphql")
const { createJwtToken } = require("../util/auth")
const verified = require("../middleware/auth")
const {user} = require("./queries");
const {models} = require("mongoose");

const isAdmin = require("../app");
const {authenticate} = require("../middleware/auth");


//const verifiedUser= User.findById()

const register = {
    type: GraphQLString,
    description: "Register new user",
    args: {
        username: { type: GraphQLString },
        role: { type: GraphQLString },
        firstname: { type: GraphQLString },
        lastname: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        avatar: { type: GraphQLString },
        avatarId: { type: GraphQLString },
        createdAt: { type: GraphQLDateTime, default: GraphQLDateTime.now},
        resetPasswordToken: { type: GraphQLString },
        resetPasswordExpires: { type: GraphQLDateTime }

    },
    async resolve(parent, args) {

        const hash = await bcrypt.hashSync(args.password, 10);
        const { username, role, firstname, lastname, email, password, avatar, avatarId, createdAt, resetPasswordToken, resetPasswordExpires } = args
        const user = new User({  username, role , firstname, lastname, email, password , avatar, avatarId, createdAt, resetPasswordToken, resetPasswordExpires  })
        user.role="utilisateur";
        user.password= hash;
        User.register(user, args.password, (err) => {
            if (err) {
                return("Error");
            }
        })
        const token = createJwtToken(user)
        return token
    }
}

const login = {
    type: GraphQLString,
    description: "Login user",
    args: {
        username: { type: GraphQLString },
        password: { type: GraphQLString },
        role: {type: GraphQLString}
    },
    async resolve(parent, args) {
        const user = await User.findOne({ username: args.username , role: args.role}).select("+password")
        const role = args.role;
        module.exports  = role;
        if (user && bcrypt.compareSync(args.password, user.password)) {
            console.log("Login Sucess!")
        } else {
            throw new Error("Wrong credentials")
        }
        const token = createJwtToken(user)
        console.log(token)
        return token

    }

}

const addUser = {
    type: GraphQLString,
    description: "Create new user",
    args: {
        username: { type: GraphQLString },
        role: { type: GraphQLString },
        firstname: { type: GraphQLString },
        lastname: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        avatar: { type: GraphQLString },
        avatarId: { type: GraphQLString },
        createdAt: { type: GraphQLDateTime, default: GraphQLDateTime.now},
        resetPasswordToken: { type: GraphQLString },
        resetPasswordExpires: { type: GraphQLDateTime }

    },


    async resolve(parent, args){
        console.log("Verified User: ",  verified)
        console.log()
        if (verified) {

            const hash = await bcrypt.hashSync(args.password, 10);
            const { username, role, firstname, lastname, email, password, avatar, avatarId, createdAt, resetPasswordToken, resetPasswordExpires } = args
            const user = new User({  username, role , firstname, lastname, email, password , avatar, avatarId, createdAt, resetPasswordToken, resetPasswordExpires  })
            user.role="utilisateur";
            user.password= hash;

            User.register(user, args.password, (err) => {
                if (err) {
                    return("Error");
                }
            })
            const token = createJwtToken(user)
            return token

        }
        throw new Error("Unauthorized")

    },
}

const updateUser = {
    type: UserType,
    description: "Update annonce",
    args: {
        id: {type: GraphQLString},
        username: { type: GraphQLString },
        role: { type: GraphQLString },
        firstname: { type: GraphQLString },
        lastname: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        avatar: { type: GraphQLString },
        avatarId: { type: GraphQLString }

    },
    async resolve(parent, args) {
        if (!verified) {
            throw new Error("Unauthenticated")
        }

        const userUpdated = await User.findByIdAndUpdate(args.id,{
                username: args.username,
                role: args.role,
                firstname: args.firstname,
                lastname: args.lastname,
                email: args.email,
                password: await bcrypt.hashSync(args.password, 10),
                avatar: args.avatar,
                avatarId: args.avatarId
            } )

        if (!userUpdated) {
            throw new Error("No user with the given ID found.")
        }

        return userUpdated
    },
}

const deleteUser = {
    type: GraphQLString,
    description: "Delete user",
    args: {
        id: { type: GraphQLString },
    },
    async resolve(parent, args) {

        if (!verified) {
            throw new Error("Unauthenticated")
        }
        console.log("athorization success!")
        const userDeleted = await User.findByIdAndDelete(args.id)

        if (!userDeleted) {
            throw new Error("No user with the given ID found.")
        }

        return "User deleted"
    },
}

const addAnnonce = {
    type: AnnonceType,
    description: "Create new annonce",
    args: {
        author: { type: GraphQLString },
        name: { type: GraphQLString },
        price: { type: GraphQLFloat },
        type: { type: GraphQLString },
        status: { type: GraphQLString },
        publication: { type: GraphQLString },
        image: { type: new GraphQLList(GraphQLString) },
        imageId: { type: new GraphQLList(GraphQLString) },
        location: { type: GraphQLString },
        description: { type: GraphQLString },
        availability: { type: GraphQLDateTime},
        createdAt: { type: GraphQLDateTime, default: GraphQLDateTime.now},
        comments: { type: new GraphQLList(GraphQLString) },
        messages: { type: new GraphQLList(GraphQLString) },
        reviews: { type: new GraphQLList(GraphQLString) }

    },
    resolve(parent, args) {
        console.log("Verified User: ", verified)
        if (!verified) {
            throw new Error("Unauthorized")
        }

        const annonce = new Annonce({
            author: verified.user._id,
            name: args.name,
            price: args.price,
            type: args.type ,
            status: args.status,
            publication: args.publication,
            image: args.image,
            imageId: args.imageId,
            location: args.location,
            description: args.description,
            availability: args.availability,
            createdAt: args.createdAt,
            comments: args.comments,
            messages: args.messages,
            reviews: args.reviews

        })

        return annonce.save()
    }
}

const updateAnnonce = {
    type: AnnonceType,
    description: "Update annonce",
    args: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        price: { type: GraphQLFloat },
        type: { type: GraphQLString },
        status: { type: GraphQLString },
        publication: { type: GraphQLString },
        image: { type: GraphQLString },
        imageId: { type: GraphQLString },
        location: { type: GraphQLString },
        description: { type: GraphQLString },
        availability: { type: GraphQLDateTime }

    },
    async resolve(parent, args) {
        if (!verified) {
            throw new Error("Unauthenticated")
        }
        const annonceUpdated = await Annonce.findOneAndUpdate(args.id,
            {
                name: args.name,
                price: args.price,
                type: args.type ,
                status: args.status,
                publication: args.publication,
                image: args.image,
                imageId: args.imageId,
                location: args.location,
                description: args.description,
                availability: args.availability
            },
        )

        if (!annonceUpdated) {
            throw new Error("No annonce with the given ID found for the author")
        }

        return annonceUpdated
    },
}

const deleteAnnonce = {
    type: GraphQLString,
    description: "Delete annonce",
    args: {
        id: { type: GraphQLString },
    },
    async resolve(parent, args) {

        if (!verified) {
            throw new Error("Unauthenticated")
        }
        const annonceDeleted = await Annonce.findByIdAndDelete(args.id)

        if (!annonceDeleted) {
            throw new Error("No annonce with the given ID found for the author")
        }

        return "Annonce deleted"
    },
}

const addComment = {
    type: CommentType,
    description: "Create a new comment on the annonce",
    args: {
        id_annonce: { type: GraphQLString },
        author: { type: GraphQLString },
        text: { type: GraphQLString }
    },
    async resolve(parent, args) {
        const comment = new Comment({
            text: args.text,
            author: verified._id
        })
        Annonce.findById(args.id_annonce).comment.push(comment.id)
        return comment.save()
    },
}

const updateComment = {
    type: CommentType,
    description: "Update comment",
    args: {
        id: { type: GraphQLString },
        id_annonce: { type: GraphQLString },
        text: { type: GraphQLString },
    },
    async resolve(parent, args) {
        if (!verified) {
            throw new Error("Unauthenticated")
        }

        const commentUpdated = await Comment.findOneAndUpdate(
            {
                id: args.id,
                author: verified._id,
            },
            { text: args.text },
            {
                new: true,
                runValidators: true,
            }
        )

        if (!commentUpdated) {
            throw new Error("No comment with the given ID found for the author")
        }

        return commentUpdated
    },
}

const deleteComment = {
    type: GraphQLString,
    description: "Delete comment",
    args: {
        id: { type: GraphQLString },
        id_annonce: { type: GraphQLString },
    },
    async resolve(parent, args) {

        if (!verified) {
            throw new Error("Unauthenticated")
        }

        const commentRemovedFromAnnonce = await Annonce.comments.findByIdAndDelete( {

                    $in: Annonce.findById(args.id_annonce).comments

            })
        const commentDeleted = await Comment.findOneAndDelete({
            id: args.id,
            author: verified._id,
        })
        if (!commentDeleted || !commentRemovedFromAnnonce) {
            throw new Error("No comment with the given ID found for the author")
        }

        return "Comment deleted"
    },
}

const addMessage = {
    type: MessageType,
    description: "Create a new message on the annonce",
    args: {
        id_annonce: { type: GraphQLString },
        author: { type: GraphQLString },
        text: { type: GraphQLString },
        replies: { type: GraphQLString }

    },
    resolve(parent, args) {
        const message = new Message({
            text: args.text,
            author: verified._id

        })
        Annonce.findById(args.id_annonce).messages.push(message.id)
        return message.save()
    },
}

const updateMessage = {
    type: MessageType,
    description: "Update message",
    args: {
        id: { type: GraphQLString },
        text: { type: GraphQLString },
    },
    async resolve(parent, args) {
        if (!verified) {
            throw  Error("Unauthenticated")
        }

        const messageUpdated = await Message.findOneAndUpdate(
            {
                id: args.id,
                author: verified,
            },
            { text: args.text },
            {
                new: true,
                runValidators: true,
            }
        )

        if (!messageUpdated) {
            throw new Error("No mesage with the given ID found for the author")
        }

        return messageUpdated
    },
}

const deleteMessage = {
    type: GraphQLString,
    description: "Delete message",
    args: {
        id: { type: GraphQLString },
        id_annonce: { type: GraphQLString },
    },
    async resolve(parent, args) {

        if (!verified) {
            throw new Error("Unauthenticated")
        }
        const messageRemovedFromAnnonce = await Annonce.messages.findOneAndDelete(
            {
                id: {
                    $in: Annonce.findById(args.id_annonce).messages
                }
            })
        const messageDeleted = await Message.findOneAndDelete({
            id: args.id,
            author: verifiedUser.id,
        })
        if (!messageDeleted || !messageRemovedFromAnnonce) {
            throw new Error("No message with the given ID found for the annonce")
        }

        return "message deleted"
    },
}

const addReply = {
    type: ReplyType,
    description: "Create a new reply on the message",
    args: {
        id_message: { type: GraphQLString },
        text: { type: GraphQLString },

    },
    async resolve(parent, args) {
        const reply = new Reply({
            text: args.text,
            author: verified._id
        })
        Annonce.findById(args.id_message).replies.push(reply.id)
        return reply.save()
    },
}

const updateReply = {
    type: ReplyType,
    description: "Update reply",
    args: {
        id: { type: GraphQLString },
        id_message:{ type: GraphQLString },
        id_annonce:{ type: GraphQLString },
        text: { type: GraphQLString },
    },
    async resolve(parent, args) {
        if (!verified) {
            throw new Error("Unauthenticated")
        }

        const replyUpdated = await Reply.findOneAndUpdate(
            {
                id: args.id,
                author: verified,
            },
            { text: args.text },
            {
                new: true,
                runValidators: true,
            }
        )

        if (!replyUpdated) {
            throw new Error("No reply with the given ID found for the message")
        }

        return replyUpdated
    },
}

const deleteReply = {
    type: GraphQLString,
    description: "Delete reply",
    args: {
        id: { type: GraphQLString },
    },
    async resolve(parent, args) {

        if (!verified) {
            throw new Error("Unauthenticated")
        }

        const replyRemovedFromMessage = await Message.replies.findOneAndDelete(
            {
                id: {
                    $in: Message.findById(args.id_annonce).replies
                }
            })

        const replyDeleted = await Reply.findOneAndDelete({
            id: args.id,
            author: verified.id,
        })
        if (!replyDeleted || !replyRemovedFromMessage ) {
            throw new Error("No reply with the given ID found for the message")
        }

        return "reply deleted"
    },
}

const addReview = {
    type: ReviewType,
    description: "Create a new review on the annonce",
    args: {
        id_annonce: { type: GraphQLString },
        text: { type: GraphQLString },
        rating: { type: GraphQLInt },

    },
    resolve(parent, args) {
        const review = new Review({
            text: args.text,
            rating: args.rating,
            author: verified._id
        })
        Annonce.findById(args.id_annonce).reviews.push(review.id)
        return review.save()
    },
}

const updateReview = {
    type: ReviewType,
    description: "Update review",
    args: {
        id: { type: GraphQLString },
        id_annonce: { type: GraphQLString },
        text: { type: GraphQLString },
        rating: { type: GraphQLInt },
    },
    async resolve(parent, args) {
        if (!verified) {
            throw new Error("Unauthenticated")
        }


        const reviewUpdated = await Review.findOneAndUpdate(
            {
                id: args.id,
                author: verified._id,
            },
            {
                text: args.text,
                rating: args.rating,
            },
            {
                new: true,
                runValidators: true,
            }
        )

        if (!reviewUpdated) {
            throw new Error("No review with the given ID found for the author")
        }
        return reviewUpdated
    },
}

const deleteReview = {
    type: GraphQLString,
    description: "Delete review",
    args: {
        id: { type: GraphQLString },
    },
    async resolve(parent, args) {

        if (!verified) {
            throw new Error("Unauthenticated")
        }

        const reviewRemovedFromAnnonce = await Annonce.reviews.findOneAndDelete(
            {
                id: {
                    $in: Annonce.findById(args.id_annonce).reviews
                }
            })

        const reviewDeleted = await Review.findOneAndDelete({
            id: args.id,
        })
        if (!reviewDeleted || !reviewRemovedFromAnnonce) {
            throw new Error("No review with the given ID found for the annonce")
        }

        return "Review deleted"
    }
}

module.exports = {
    register,
    login,
    addUser,
    updateUser,
    deleteUser,
    addAnnonce,
    addComment,
    addMessage,
    addReply,
    addReview,
    updateAnnonce,
    deleteAnnonce,
    updateComment,
    deleteComment,
    updateMessage,
    deleteMessage,
    updateReply,
    deleteReply,
    updateReview,
    deleteReview
}