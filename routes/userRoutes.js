const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const express = require("express");
const router = express.Router();
// router.param("id", userController.validateID);

router.post('/signup', authController.signup);
router.post("/login", authController.login);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
