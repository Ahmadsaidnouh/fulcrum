import crypto from "crypto";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import asyncHandler from "express-async-handler";

import User from "../../models/user.model";
import ApiError from "../../utils/apiError";
import sendOTPEmail from "../../utils/sendEmail";
import generateToken from "../../utils/generateToken";

const generateOTP = () => {
  // Generate a random buffer of 4 bytes (32 bits)
  const randomBytes = crypto.randomBytes(4);

  // Convert the random bytes to a 32-bit unsigned integer
  const randomValue = randomBytes.readUIntBE(0, 4);

  // Map the random value to the range 000000 - 999999
  const otp = randomValue % 1000000;

  // Pad the OTP with leading zeros if necessary
  return otp.toString().padStart(6, "0");
};

// @desc    Signup
// @route   POST /api/v1/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res, next) => {
  // 1- Create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password, // will be hashed my the mongoose middleware
  });

  // 2- Generate token
  const token = generateToken(user._id.toString());

  // 4- Send response to client side
  res.status(201).json({ data: user, token });
});

// @desc    Login
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  // 1- Check if password and email are in the body (in validation layer)

  // 2- Check if user exist and check that passwpord is correct
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user?.password))) {
    // Don't display where is the error with details.
    // Don't say "Email is not existing" or "Password is incorrect".
    // For security whise, give ambiguity
    return next(new ApiError("Incorrect email or password", 401));
  }

  // 3- Generate token
  const token = generateToken(user._id.toString());

  // 4- Send response to client side
  res.status(200).json({ data: user, token });
});

// @desc    Make sure that the user is existing and is logged in
const authenticate = asyncHandler(async (req: any, res, next) => {
  // 1) Check if token exists; if exists, read it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError("You are not logged in, please loggin first", 401)
    );
  }

  // 2) Verify token (no change happens on the token, expired token)
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET_KEY as string
  ) as jwt.JwtPayload;

  // 3) Check if user exists and active ... can handle whether active or not in a separate if condition
  const currentUser = await User.findOne({
    _id: decoded.userId.toString(),
    active: true,
  });
  if (!currentUser) {
    return next(
      new ApiError("User belonging to this token does no longer exists", 401)
    );
  }

  // 4) Check if user change his password after token creation
  if (currentUser.passwordChangedAt) {
    // Convert from Date to timestamp in seconds
    // currentUser.passwordChangedAt.getTime() == > converts date to timestamp but in milliseconds,
    // so we will divide by 1000 to convert it to seconds
    const passChangedTimeStamp = parseInt(
      (currentUser.passwordChangedAt.getTime() / 1000).toString(),
      10
    );
    if (passChangedTimeStamp > Number(decoded.iat)) {
      // Password changed after token have been generated
      return next(
        new ApiError(
          "User has recently changed his password, please login again...",
          401
        )
      );
    }
  }

  req.user = currentUser; // giving error because req is of type Request and i want to add a vfield to it
  next();
});

// @desc    Make sure that the user is allowed to access such route
const authorize = (...roles: string[]) =>
  asyncHandler(async (req: any, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

// @desc    Forget password
// @route   POST /api/v1/auth/forgetPassword
// @access  Public
const forgetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError(`No user with such email ${req.body.email}`, 404));
  }

  // 2) If user exists, generate hash reset random 6 digits and save it in the DB
  //   const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const resetCode = generateOTP();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save hashed password reset code into DB
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (3 min)
  const durationInMinutes = 3;
  user.passwordResetExpiration = new Date(
    Date.now() + durationInMinutes * 60 * 1000
  );
  user.passwordResetVerified = false;

  await user.save();

  // 3) Send reset code via email
  try {
    await sendOTPEmail({ email: user.email, otp: resetCode });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpiration = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError("There is an error in sending OTP email", 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});

// @desc    Verify password reset
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
const verifyResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    email: req.body.email,
    passwordResetCode: hashedResetCode,
    passwordResetExpiration: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invalid or expired", 404));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ status: "Success" });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email, reset code and reset expiration
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return next(new ApiError(`No user with such email ${req.body.email}`, 404));
  }

  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }
  user.password = req.body.newPassword;
  user.passwordChangedAt = new Date(Date.now());
  user.passwordResetCode = undefined;
  user.passwordResetExpiration = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) If everything is ok, generate token
  const token = generateToken(user._id.toString());
  res.status(200).json({ data: user, token });
});

export {
  signup,
  login,
  // authenticate,
  // authorize,
  forgetPassword,
  verifyResetCode,
  resetPassword,
};
// export default { authenticate, authorize };
