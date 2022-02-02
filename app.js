var dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
var app = express();
var Annonce = require("./models/annonce");
var User = require("./models/user");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var seedDB = require("./seeds");
var Comment = require("./models/comment");
var User = require("./models/user");
var methodOverride = require("method-override");
var flash = require("connect-flash");

//imports graphql
const { rule, shield, and, or, not } = require("graphql-shield");

const port = process.env.PORT || 3000;


// Requiring ROUTES
var commentRoutes = require("./routes/comments");
var messageRoutes = require("./routes/messages");
var replyRoutes = require("./routes/replies");
var reviewRoutes = require("./routes/reviews");
var annonceRoutes = require("./routes/annonces");
var userRoutes = require("./routes/users");
var indexRoutes = require("./routes/index");
var { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/schema");
const jwt = require("jsonwebtoken");

const { authenticate } = require("./middleware/auth")

//GraphQl
mongoose.connect("mongodb://127.0.0.1:27017/essai", {useNewUrlParser: true });
function getClaims(req) {
    let token;
    try {
        token = jwt.verify(req.request.headers.authorization, "MY_TOKEN_SECRET");
        req.verifiedUser = token.user
    } catch (e) {
        return null;
    }
    console.log(token);
    return token;
}
// Rules
const isAuthenticated = rule()(async (parent, args, ctx, info) => {
    return ctx.claims !== null;
});
const isAdmin = rule()(async (parent, args, ctx, info) => {
    return ctx.claims.role === "admin";
});
const isAgent = rule()(async (parent, args, ctx, info) => {
    return ctx.claims.role === "agent";
});
const isUser = rule()(async (parent, args, ctx, info) => {
    return ctx.claims.role === "utilisateur";
});


// Permissions
const permissions = shield({
    Query: {
        user: and(isAuthenticated),
        users: and(isAuthenticated),
        comment: and(isAuthenticated),
        comments: and(isAuthenticated),
        message: and(isAuthenticated, or(isAdmin,isAgent)),
        messages: and(isAuthenticated, or(isAdmin,isAgent)),
        reply: and(isAuthenticated, or(isUser,isAdmin,isAgent)),
        replies: and(isAuthenticated, or(isAdmin,isAgent)),
        review: and(isAuthenticated, or(isAdmin,isAgent)),
        reviews: and(isAuthenticated, or(isAdmin,isAgent))
    },
    Mutation: {
        addUser: and(isAuthenticated, and(isAdmin,isAgent)),
        updateUser: and(isAuthenticated, or(isAdmin,isAgent)),
        deleteUser: and(isAuthenticated, or(isAdmin,isAgent)),
        addAnnonce: and(isAuthenticated, or(isAdmin,isAgent)),
        updateAnnonce: and(isAuthenticated, or(isAdmin,isAgent)),
        deleteAnnonce: and(isAuthenticated, or(isAdmin,isAgent)),
        addComment: and(isAuthenticated, isUser),
        updateComment: and(isAuthenticated, isUser),
        deleteComment: and(isAuthenticated, isUser),
        addMessage: and(isAuthenticated, isUser),
        updateMessage:and(isAuthenticated, isUser),
        deleteMessage:and(isAuthenticated, isUser),
        addReply: and(isAuthenticated, or(isAdmin,isAgent)),
        updateReply: and(isAuthenticated, or(isAdmin,isAgent)),
        deleteReply: and(isAuthenticated, or(isAdmin,isAgent)),
        addReview: and(isAuthenticated, isUser),
        updateReview:and(isAuthenticated, isUser),
        deleteReview:and(isAuthenticated, isUser)

    },
});

app.use(authenticate)

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
    middlewares: [permissions],
    context: (req) => ({
        claims: getClaims(req),
    }),


}));


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash()); // flash updates
// seedDB(); // seed the database
app.locals.moment = require("moment");

// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Madjid's Secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
// passport-local-mongoose config
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// currentUser
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/annonces", annonceRoutes);
app.use("/users", userRoutes);
app.use("/annonces/:id/reviews", reviewRoutes);
app.use("/annonces/:id/comments", commentRoutes);
app.use("/annonces/:id/messages", messageRoutes);
app.use("/annonces/:id/messages/:id/replies", replyRoutes);
app.use("/uploads", express.static("uploads"));


// Express listens for requests (Start server)
app.listen(port, () => console.log(`Site des annonces starting on port ${port}!`))
module.exports = isAdmin