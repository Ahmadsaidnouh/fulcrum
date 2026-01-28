import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config();
import ApiError from "./src/utils/apiError";
import globalError from "./src/middlewares/error.middleware";
import dbConnection from "./src/config/database";
import {
  authRoutes,
  orderRoutes,
  paymentRoutes,
  webhookRoutes,
  staticRoutes,
} from "./src/routes/allroutes";

// Connect with db
dbConnection();

// express app
const app = express();

// Middlewares
app.use(
  cors({
    origin: "*",
  }),
);

/**
 * Stripe webhooks MUST receive raw body
 * This route must be registered BEFORE express.json()
 */
app.use(
  `${process.env.PREFIX}/webhooks`,
  express.raw({ type: "application/json" }),
  webhookRoutes,
);

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});
app.use(`${process.env.PREFIX}/auth`, authRoutes);
app.use(`${process.env.PREFIX}/orders`, orderRoutes);
app.use(`${process.env.PREFIX}/payments`, paymentRoutes);
app.use(`/static`, staticRoutes);
// app.use(`${process.env.PREFIX}/webhooks`, webhookRoutes);
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "Working Successfully" });
});
app.use(/.*/, (req, res, next) => {
  // app.use(`*`, (req, res, next) => { --> "*" now causes error in express 5, use "/*" instead
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running running on port ${PORT}`);
});

// Handling rejection outside express
process.on("unhandledRejection", (err: any) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    // To make sure that all process will end only after server ends its pending ones

    console.error(`Server is shutted down`);
    process.exit(1);
    // console.error(`Shutting down...`);
  });
});
