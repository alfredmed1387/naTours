const Tour = require("./../models/tour");
const functionFactory = require("./functionFactory");

exports.createTour = functionFactory.createOne(Tour);
exports.updateTour = functionFactory.updateOne(Tour);
exports.deleteTour = functionFactory.deleteOne(Tour);
exports.getTour = functionFactory.getOne(Tour, { path: "reviews" });
exports.getAllTours = functionFactory.getAll(Tour);

exports.validateBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "invalid name or price",
    });
  }
  next();
};
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};
exports.getTourStats = (req, res, next) => {
  const query = Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);
  query
    .then((stats) => {
      res.status(200).json({
        status: "success",
        data: {
          stats,
        },
      });
    })
    .catch(({ errmsg, message }) => {
      console.error(errmsg, message);
      res.status(404).json({
        status: "fail",
        message: errmsg || message,
      });
    });
};
exports.getMonthlyPlan = (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const query = Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  query
    .then((plan) => {
      res.status(200).json({
        status: "success",
        data: {
          plan,
        },
      });
    })
    .catch(({ errmsg, message }) => {
      console.error(errmsg, message);
      res.status(404).json({
        status: "fail",
        message: errmsg || message,
      });
    });
};
