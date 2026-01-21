import ApiError from "../utils/apiError";

const sendErrorForDev = (err: any, res: any) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProd = (err: any, res: any) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const handleJwtInvalidSignature = () =>
  new ApiError("Invalid token, please login again...", 401);

const handleJwtExpired = () =>
  new ApiError("Token expired, please login again...", 401);

const globalError = (err: any, req: any, res: any, next: any) => {
  // express understands when four params then this is global error middleware
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name == "JsonWebTokenError") err = handleJwtInvalidSignature();
    else if (err.name == "TokenExpiredError") err = handleJwtExpired();
    sendErrorForProd(err, res);
  }
};

export default globalError;
