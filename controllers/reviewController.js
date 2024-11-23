const Review = require("./../models/review");
const CatchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const functionFactory =  require('./functionFactory');

exports.delete = functionFactory.deleteOne(Review);
exports.update = functionFactory.updateOne(Review);
exports.GetAll = functionFactory.getAll(Review);
exports.Get = CatchAsync(async (req, res, next) => {
  let query = Review;
  if (req.params.tourId) query = query.find({ tour: req.params.tourId });

  const review = await query.find({ _id: req.params.id });

  if (!review) {
    return next(new AppError("Review not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});
exports.Create = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const createfunction = functionFactory.createOne(Review);
  createfunction(req, res, next);
};
exports.SetTourID = (req, res, next) => {
  if (!req.query.tour && req.params.tourId) req.query.tour = req.params.tourId;
  next();
};
