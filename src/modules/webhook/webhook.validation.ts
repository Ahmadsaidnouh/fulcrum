import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validator.middleware";

const handlePaymentWebhookValidator = [
  check("paymentId")
    .notEmpty()
    .withMessage("Payment ID is required")
    .isMongoId()
    .withMessage("Invalid payment ID format"),
  check("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["SUCCESS", "FAILED"])
    .withMessage("Invalid status"),
  check("signature")
    .notEmpty()
    .withMessage("Signature is required"),
  validatorMiddleware,
];

export { handlePaymentWebhookValidator };