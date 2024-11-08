const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController')

const express = require("express");
const router = express.Router();

//router.param('id', tourController.validateID);

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);


router
  .route("/")
  .get(authController.protect,tourController.getAllTours)
  .post(tourController.validateBody, tourController.createTour);
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
