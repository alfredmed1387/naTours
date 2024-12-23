const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "review can not be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "review must belong to a tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "review must belong to a user"],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

reviewSchema.pre(/^find/, function (next) {
  this.find().populate({ path: "user", select: "name" })//.populate("tour");
  next();
});
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
