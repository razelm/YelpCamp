const express = require("express");
const handleError = require("../utility/handleError");
const router = express.Router();
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const campgrounds = require("../controllers/campgrounds");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });


router.route("/").get(handleError(campgrounds.index)).post(
  isLoggedIn,
  upload.array("image"),
  validateCampground,
  handleError(campgrounds.createCampground)
);
// .post(upload.array("image"), (req, res, next) => {
//   console.log(req.body, req.files);
//   res.send("File was uploaded");
// });

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(handleError(campgrounds.viewDetails))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    handleError(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, handleError(campgrounds.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  handleError(campgrounds.renderEditForm)
);

module.exports = router;
