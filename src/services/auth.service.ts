import crypto from "crypto";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import asyncHandler from "express-async-handler";

import User from "../models/user.model";
import ApiError from "../utils/apiError";

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

export default { authenticate, authorize };
