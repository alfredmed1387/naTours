const { promisify } = require("util");

const AppError = require("../utils/appError");
const User = require("./../models/user");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");

const signToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    ...req.body,
    role: req.body?.role === "admin" ? "user" : req.body?.role,
  });

  const token = signToken(newUser);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("email and password are required", 400));
  }
  const user = await User.findOne({ email: email }).select("+password");
  const isCorrectPassword = await user?.isCorrectPassword(
    password,
    user.password,
  );
  if (!user || !isCorrectPassword) {
    return next(new AppError("incorrect username y/o password", 400));
  }
  const token = signToken(user);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.substring(7);
  }
  if (!token) {
    return next(new AppError("you are not authorized", 401));
  }
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401,
      ),
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decodedToken.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401),
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});
