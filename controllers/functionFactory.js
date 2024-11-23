const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const apiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("Document not found", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("Document not found", 404));
    }
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;
    if (!doc) {
      return next(new AppError("document not found", 404));
    }
    res.status(200).json({
      reuestedAt: req.requestTime,
      status: "success",
      data: doc,
    });
  });

exports.getAll = (Model) =>
  
  catchAsync(async (req, res) => {
    console.log(req.query);
    const features = new apiFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const docs = await features.query;
    const docs = await features.query.explain();
    res.status(200).json({
      reuestedAt: req.requestTime,
      status: "success",
      results: docs.length,
      data: docs,
    });
  });
