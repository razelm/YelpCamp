if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const morgan = require("morgan");
const ExpressError = require("./utility/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const userRoutes = require("./routes/authentication");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");

const MongoStore = require("connect-mongo");
// const dbUrl = ;
//"mongodb://127.0.0.1:27017/yelp-camp",
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const secret = process.env.SECRET;

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
  console.log("Database connected!");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
//Mongo Sanitize
app.use(mongoSanitize());

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24* 60 * 60,
  crypto: {
    secret,
  }
});
store.on("error", function(e){
  console.log("Store error", e);
});

//Session
const sessionConfig = {
  store,
  name:"sesh",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24,
    maxAge: 1000 * 60 * 60 * 24,
  },
};
app.use(session(sessionConfig));

//Passport Configuration //Needs to be placed after Session to work
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Helmet
// app.use(
//   helmet()
// );


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com/mapbox-gl-js/v2.8.1/mapbox-gl.js",
];
const styleSrcUrls = [
      "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css",
    "https://api.mapbox.com/mapbox-gl-js/v2.8.1/mapbox-gl.css",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap",

];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/da4yaqn2e/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://via.placeholder.com/500x500",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//Flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});



//Routes
// app.use("/yelpcamp", yelpcampRoutes);
// app.use("/home", Routes);
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);


app.get('/home', (req, res) => {
    res.render('home')
});


//Error Handling
app.all("*", (req, res, next) => {
  next(new ExpressError());
});

app.use((err, req, res, next) => {
  res.status(404).render("404");
  console.log(err);
});

// app.use((err, req, res, next) => {
//   const { statusCode = 500 } = err;
//   if (!err.message) err.message = "OH NO! Something went terribly wrong! :(";
//   res.status(statusCode).render("error", { err });
//   console.log(err);
// });

//Local Host
app.listen(3000, () => {
  console.log("Port 3000 open");
});
