const Review = require("../models/review");
const Campground = require("../models/campground");

//Create review
module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Your review was posted!");
  res.redirect(`/campgrounds/${campground._id}`);
  console.log(review);
};

// module.exports.editReviews = async (req, res, next) => {
//   await Review.findByIdAndUpdate(req.params.review_id, req.body.review);
//   req.flash("success", "Review updated successfully!");
//   res.redirect(`/campgrounds/${req.params.id}`);
//    console.log(review);
// };

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(req.params.reviewId);
  req.flash("success", "Your review was deleted!");
  res.redirect(`/campgrounds/${id}`);
};
