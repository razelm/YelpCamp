const { campgroundSchema, reviewSchema } = require("./JoiSchemaValidation");
const Campground = require("./models/campground");
const Review = require("./models/review");
const ExpressError = require("./utility/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

//Campground Validation
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const errorMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errorMsg, 400);
  } else {
    next();
  }
};

//Reviews Validation
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errorMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errorMsg, 400);
   
  } else {
    next();
  }
};

//Campground Author Auth
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

//Review Author Auth
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
