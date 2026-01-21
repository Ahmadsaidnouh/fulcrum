import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validator.middleware";

const createOrderValidator = [
  check("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a number greater than zero"),
  validatorMiddleware,
];

const cancelOrderValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid order id format"),
  validatorMiddleware,
];

export { createOrderValidator, cancelOrderValidator };
