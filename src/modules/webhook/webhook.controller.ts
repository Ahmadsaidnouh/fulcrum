import asyncHandler from "express-async-handler";
import paymentService from "../../services/payment.service";
import ApiError from "../../utils/apiError";

/**
 * @desc    Handle payment gateway webhook
 * @route   POST /api/v1/webhooks/payments
 * @access  Public (secured via signature)
 */
export const handlePaymentWebhook = asyncHandler(async (req, res) => {
  // TODO: In production, move webhook processing to a queue

  const { paymentId, status, signature } = req.body;

  // Verify webhook signature (mocked for now)
  // In real life: HMAC + shared secret
  if (signature !== "valid-signature") {
    throw new ApiError("Invalid webhook signature", 401);
  }

  // Act based on gateway decision
  if (status === "SUCCESS") {
    await paymentService.confirmPayment(paymentId);
  }

  if (status === "FAILED") {
    await paymentService.failPayment(paymentId);
  }

  // 4️⃣ Gateway expects 200 OK always
  res.status(200).json({ received: true });
});
