const ReviewController = require("./../controllers/reviewController");
const AuthControler = require("./../controllers/authController");

const express = require("express");
const router = express.Router({ mergeParams: true });

router.use(AuthControler.protect);
router
  .route("/")
  .get(ReviewController.SetTourID, ReviewController.GetAll)
  .post(AuthControler.restrictTo("user"), ReviewController.Create);

router
  .route("/:id")
  .get(ReviewController.Get)
  .delete(AuthControler.restrictTo("user", "admin"), ReviewController.delete)
  .patch(AuthControler.restrictTo("user", "admin"), ReviewController.update);

module.exports = router;
