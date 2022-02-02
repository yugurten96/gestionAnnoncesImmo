// Import required stuff from graphql
const { GraphQLSchema, GraphQLObjectType } = require("graphql")

// Import queries
const { users, user, annonces, annonce, comments, comment, messages, message, replies, reply, reviews, review } = require("./queries")

// Import mutations
const {
  register,
  login,
  addUser,
  updateUser,
  deleteUser,
  addAnnonce,
  updateAnnonce,
  deleteAnnonce,
  addComment,
  updateComment,
  deleteComment,
  addMessage,
  updateMessage,
  deleteMessage,
  addReply,
  updateReply,
  deleteReply,
  addReview,
  updateReview,
  deleteReview
} = require("./mutations")

// Define QueryType
const QueryType = new GraphQLObjectType({
  name: "QueryType",
  description: "Queries",
  fields: { users, user, annonces, annonce, comments, comment, messages, message, replies, reply, reviews, review },
})

// Define MutationType
const MutationType = new GraphQLObjectType({
  name: "MutationType",
  description: "Mutations",
  fields: () => ({
    register,
    login,
    addUser,
    updateUser,
    deleteUser,
    addAnnonce,
    updateAnnonce,
    deleteAnnonce,
    addComment,
    updateComment,
    deleteComment,
    addMessage,
    updateMessage,
    deleteMessage,
    addReply,
    updateReply,
    deleteReply,
    addReview,
    updateReview,
    deleteReview

  }),
})

module.exports = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
})