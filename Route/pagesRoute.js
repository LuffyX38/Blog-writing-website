const router = require("express").Router();
const authController = require("../Controller/authController");
const userController = require("../Controller/userController");

router.get("/main", authController.isSignedIn, (req, res) => {

    res.render("index");
})
module.exports = router;