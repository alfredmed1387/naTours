const AppError = require("../utils/appError");
const Tour = require("./../models/tour");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
const CatchAsync = require("./../utils/catchAsync");

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
exports.getAllTours = catchAsync(async (req, res) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;
  res.status(200).json({
    reuestedAt: req.requestTime,
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
  // features.query
  //   .then((tours) => {
  //     res.status(200).json({
  //       reuestedAt: req.requestTime,
  //       status: "success",
  //       results: tours.length,
  //       data: {
  //         tours,
  //       },
  //     });
  //   })
  // .catch(({ errmsg, message }) => {
  //   res.status(400).json({
  //     status: "fail",
  //     message: errmsg || message,
  //   });
  // });
});
exports.createTour = CatchAsync(async (req, res) => {
  const result = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      tour: result,
    },
  });

  // Tour.create(req.body)
  //   .then((doc) => {
  //     res.status(201).json({
  //       status: "success",
  //       data: {
  //         tour: doc,
  //       },
  //     });
  //   })
  // .catch(({ errmsg, message }) => {
  //   res.status(400).json({
  //     status: "fail",
  //     message: errmsg || message,
  //   });
  // });
});
exports.getTour = CatchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError("tour not found", 404));
  }
  res.status(200).json({
    reuestedAt: req.requestTime,
    status: "success",
    data: {
      tour,
    },
  });

  // .then((tour) => {
  //   res.status(200).json({
  //     reuestedAt: req.requestTime,
  //     status: "success",
  //     data: {
  //       tour,
  //     },
  //   });
  // })
  // .catch(({ errmsg, message }) => {
  //   console.error(errmsg, message);
  //   res.status(404).json({
  //     status: "fail",
  //     message: errmsg || message,
  //   });
  // });
});

exports.updateTour = (req, res, next) => {
  Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .then((doc) => {
      console.log(doc);
      res.status(200).json({
        status: "success",
        data: doc,
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
exports.deleteTour = (req, res, next) => {
  Tour.findByIdAndDelete(req.params.id)
    .then((doc) => {
      if (!doc) {
        return next(new AppError('Tour not found', 404))
      }
      res.status(204).json({
        status: "success",
        data: null,
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
