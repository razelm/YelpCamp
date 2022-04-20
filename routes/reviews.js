const express = require("express");
const handleError = require("../utility/handleError");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews");
const router = express.Router({ mergeParams: true });

//Post review
router.post("/", isLoggedIn, validateReview, handleError(reviews.createReview));

//Edit Review
router.put(
  "/campgrounds/:id/reviews/:review_id",
  isLoggedIn,
  isReviewAuthor,
  handleError(reviews.editReviews)
);

//Delete Review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  handleError(reviews.deleteReview)
);

module.exports = router;
