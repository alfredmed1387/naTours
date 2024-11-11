const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
const second = 1;
const minute = 60 * second;
const hour = 60 * minute;

const limiter = rateLimit({
  max: 100,
  windowMs: hour * 1000, // seconds to miliseconds
  message: "to many requests, try again in one hour",
});

app.use("/api", limiter);
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());
app.use(xssClean());
app.use(
  hpp({
    whitelist: [
      "duration",
      "name",
      "maxGroupSize",
      "difficulty",
      "ratingsAverage",
      "ratingsQuantity",
      "price"
    ],
  }),
);
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
