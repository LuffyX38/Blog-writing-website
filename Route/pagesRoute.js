const router = require("express").Router();
const authController = require("../Controller/authController");
const userController = require("../Controller/userController");

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

module.exports = router;