import slugify from "slugify";
import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validator.middleware";
import User from "../../models/user.model";

const signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required")
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(req.body.name);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in use"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Passowrd must be atleast 6 characters"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((passwordConfirm, { req }) => {
      if (passwordConfirm !== req.body.password) {
        throw new Error("Password confirmation is incorrect");
      }
      return true;
    }),
  validatorMiddleware,
];

const loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Passowrd must be atleast 6 characters"),
  validatorMiddleware,
];

const forgetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  validatorMiddleware,
];

const verifyResetCodeValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  check("resetCode").notEmpty().withMessage("Reset code is required"),
  validatorMiddleware,
];

const resetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  check("newPassword")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Passowrd must be atleast 6 characters"),
  check("newPasswordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((passwordConfirm, { req }) => {
      if (passwordConfirm !== req.body.newPassword) {
        throw new Error("Password confirmation is incorrect");
      }
      return true;
    }),
  validatorMiddleware,
];

export { signupValidator, loginValidator, forgetPasswordValidator, verifyResetCodeValidator, resetPasswordValidator };
