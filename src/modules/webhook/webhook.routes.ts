import { Router } from "express";
import { handlePaymentWebhook } from "./webhook.controller";
import { handlePaymentWebhookValidator } from "./webhook.validation";


const router = Router();

/**
 * Payment gateway webhook
 * Stripe / Paymob / Checkout
 */
router.post("/payments", handlePaymentWebhookValidator, handlePaymentWebhook);

export default router;
