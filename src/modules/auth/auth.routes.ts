import { Router } from "express";

import { signup, login, forgetPassword, verifyResetCode, resetPassword } from "./auth.controller";

import { signupValidator, loginValidator, forgetPasswordValidator, verifyResetCodeValidator, resetPasswordValidator } from "./auth.validation";

const router = Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgetPassword", forgetPasswordValidator, forgetPassword);
router.post("/verifyResetCode", verifyResetCodeValidator, verifyResetCode);
router.put("/resetPassword", resetPasswordValidator, resetPassword);

export default router;
