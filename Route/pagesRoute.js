const router = require("express").Router();
const authController = require("../Controller/authController");
const userController = require("../Controller/userController");
const friendController = require("../Controller/friendController");

router.get("/main", authController.isSignedIn, (req, res) => {
  res.render("index");
});

router.get("/create", authController.isSignedIn, (req, res) => {
  res.render("createblog");
});

router.get("/update-profile", authController.isSignedIn, (req, res) => {
  res.render("updateProfile");
});

router.get("/register", authController.isSignedIn, (req, res) => {
  res.render("register");
});

router.get("/login", authController.isSignedIn, (req, res) => {
  res.render("login");
});

router.get("/update-password", authController.isSignedIn, (req, res) => {
  res.render("update-password");
});

router.get("/my-posts", authController.isSignedIn, (req, res) => {
  res.render("my-profile");
});

router.get("/see-users", (req, res) => {
  res.render("see-users");
});

router.get("/see-users/:user_id", (req, res) => {
  res.render("user-profile");
});

router.get("/accept-friend-request/:user_id", (req, res) => {
  res.render("accept-req");
});

router.get(
  "/see-users/:user_id/userInfo",
  authController.isSignedIn,
  friendController.userProfile
);

router.get(
  "/accept-friend-request/:user_id/userInfo",
  authController.isSignedIn,
  friendController.userProfile
);

router.get("/requests", (req, res) => {
  res.render("requests");
});

module.exports = router;
