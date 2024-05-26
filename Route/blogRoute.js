const express = require("express");
const router = express.Router();
const blogController = require("../Controller/blogController");

router.route("/create-blog").post(blogController.createBlog);
router.route("/get-blog").get(blogController.getBlogs);
router.route("/delete-blog").delete(blogController.deleteBlog);

module.exports = router;
