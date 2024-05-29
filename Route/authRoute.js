const express = require("express");
const router = express.Router();
const authController = require("../Controller/authController");


router.route("/signup").post(authController.signup);
router.route("/signin").post(authController.signin);
router.route("/signout").get(authController.signout);
router.route("/forgotPassword").patch(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);
router.route("/signout").get(authController.signout);

module.exports = router;