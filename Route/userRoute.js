const router = require("express").Router();
const userController = require("../Controller/userController");
const authController = require("../Controller/authController");

router.route("/profile").get(authController.isSignedIn, userController.profile);
router
  .route("/updatePassword")
  .patch(authController.isSignedIn, userController.updateCurrentPassword);

router
  .route("/updateProfile")
  .patch(
    authController.isSignedIn,
    userController.uploadImage,
    userController.resizeUploadedImage,
    userController.uploadToCloudinary,
    userController.updateProfile
  );
/*
  flow of this router : authenticated ->(if) uploads image ->(if) resize uploaded image ->(if) upload to cloud -> updates profile
*/

module.exports = router;
