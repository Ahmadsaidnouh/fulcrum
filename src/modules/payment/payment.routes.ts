import { Router } from "express";

import { createPayment, confirmPayment, createCheckoutSession } from "./payment.controller";

import { createPaymentValidator, confirmPaymentValidator, createCheckoutSessionValidator } from "./payment.validation";
import authService from "../../services/auth.service";

const router = Router();

router.post(
  "/",
  authService.authenticate,
  authService.authorize("user"),
  createPaymentValidator,
  createPayment
);
router.post(
  "/:paymentId/confirm",
  authService.authenticate,
  authService.authorize("admin"),
  confirmPaymentValidator,
  confirmPayment
);
router.post(
  "/createCheckoutSession",
  authService.authenticate,
  authService.authorize("user"),
  createCheckoutSessionValidator,
  createCheckoutSession
);
// router.post(
//   "/:id/cancel",
//   authService.authenticate,
//   authService.authorize("user"),
//   cancelOrderValidator,
//   cancelOrder
// );

export default router;
