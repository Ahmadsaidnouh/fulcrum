import { Router } from "express";

import { createOrder, cancelOrder } from "./order.controller";

import { createOrderValidator, cancelOrderValidator } from "./order.validation";
import authService from "../../services/auth.service";

const router = Router();

router.post(
  "/",
  authService.authenticate,
  authService.authorize("user"),
  createOrderValidator,
  createOrder
);
router.post(
  "/:id/cancel",
  authService.authenticate,
  authService.authorize("user"),
  cancelOrderValidator,
  cancelOrder
);

export default router;
