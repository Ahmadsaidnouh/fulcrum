import { Router, raw } from "express";
import { handlePaymentWebhook, confirmCheckoutSession } from "./webhook.controller";
import { handlePaymentWebhookValidator } from "./webhook.validation";


const router = Router();

/**
 * Payment gateway webhook
 * Stripe / Paymob / Checkout
 */
router.post("/payments", handlePaymentWebhookValidator, handlePaymentWebhook);
router.post("/confirmCheckSession", raw({type: 'application/json'}), confirmCheckoutSession);

export default router;
