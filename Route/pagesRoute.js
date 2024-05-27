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


module.exports = router;