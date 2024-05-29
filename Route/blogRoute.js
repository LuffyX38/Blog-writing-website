const express = require("express");
const router = express.Router();
const blogController = require("../Controller/blogController");
const authController = require("../Controller/authController");

router.route("/create-blog").post(authController.isSignedIn, blogController.createBlog);
router.route("/get-blog").get(blogController.getBlogs);
router.route("/delete-blog").delete(blogController.deleteBlog);
router.route("/my-blog").get(authController.isSignedIn,blogController.getMyBlogs);

module.exports = router;
