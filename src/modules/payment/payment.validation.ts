import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validator.middleware";

const createPaymentValidator = [
  check("orderId")
    .notEmpty()
    .withMessage("Order ID is required")
    .isMongoId()
    .withMessage("Invalid order ID format"),
  validatorMiddleware,
];

const createCheckoutSessionValidator = [
  check("orderId")
    .notEmpty()
    .withMessage("Order ID is required")
    .isMongoId()
    .withMessage("Invalid order ID format"),
  validatorMiddleware,
];

const confirmPaymentValidator = [
  check("paymentId")
    .notEmpty()
    .withMessage("Payment ID is required")
    .isMongoId()
    .withMessage("Invalid payment ID format"),
  validatorMiddleware,
];


export { createPaymentValidator, confirmPaymentValidator, createCheckoutSessionValidator };