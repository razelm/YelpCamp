const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const users = require("../controllers/users");
const handleError = require("../utility/handleError");

//Register
router
  .route("/register")
  .get(users.renderRegister)
  .post(handleError(users.register));

//Login
router
  .route("/login")
  .get(users.renderLoginForm)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

//Logout
router.get("/logout", users.logout);

module.exports = router;
