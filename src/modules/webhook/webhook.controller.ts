import asyncHandler from "express-async-handler";
import Stripe from "stripe";

import paymentService from "../../services/payment.service";
import ApiError from "../../utils/apiError";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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

/**
 * @desc    Handle payment gateway webhook
 * @route   POST /api/v1/webhooks/payments
 * @access  Public (secured via signature)
 */
export const confirmCheckoutSession = asyncHandler(
  async (request: any, response: any) => {
    // TODO: In production, move webhook processing to a queue
    let event;
    // Get the signature sent by Stripe
    const signature: any = request.headers["stripe-signature"];
    console.log("<signature>", signature);
    console.log("request.body = ", request.body);
    console.log("process.env.STRIPE_WEBHOOK_SECRET = ", process.env.STRIPE_WEBHOOK_SECRET);
    
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
      console.log("<event>", event);
      
    } catch (err: any) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("inside checkout.session.completed");
        
        // call your service:
        await paymentService.confirmStripePayment(session);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    response.status(200).json({ received: true });
  },
);
