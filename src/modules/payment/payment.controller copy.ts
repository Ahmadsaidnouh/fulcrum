import asyncHandler from "express-async-handler";

import Payment from "../../models/payment.model";
import paymentService from "../../services/payment.service";
import ApiError from "../../utils/apiError";
import { processPayment } from "../../workers/payment.worker";

// @desc    CreatePayment
// @route   POST /api/v1/payments
// @access  Public
const createPayment = asyncHandler(async (req: any, res) => {
  const payment = await paymentService.createPayment(
    req.user._id.toString(),
    req.body.orderId,
    req.body.idempotencyKey ? req.body.idempotencyKey : null,
    "CASH"
  );

  //   // Fire-and-forget async payment processing (simulated gateway)
  //   processPayment(payment._id.toString());

  res.status(200).json({ data: payment });
});

// @desc    ConfirmPayment
// @route   POST /api/v1/payments/:paymentId/confirm
// @access  Private
const confirmPayment = asyncHandler(async (req: any, res) => {
  const payment = await paymentService.confirmPayment(req.params.paymentId);

  res.status(200).json({ data: payment });
});

// const createCheckoutSession = asyncHandler(async (req: any, res) => {
//   const payment = await paymentService.createPayment(
//     req.user._id.toString(),
//     req.body.orderId,
//     req.body.idempotencyKey ? req.body.idempotencyKey : null,
//   );

//   const session = await stripe.checkout.sessions.create({
//     line_items: [
//       {
//         price_data: {
//           currency: "egp",
//           product_data: {
//             name: "Order Payment",
//           },
//           unit_amount: payment.amount ? payment.amount * 100 : 0, // Stripe expects amount in cents
//         },
//         quantity: 1,
//       },
//     ],
//     mode: "payment",
//     // success_url: `${process.env.FRONTEND_URL}/success`,
//     // cancel_url: `${process.env.FRONTEND_URL}/cancel`,
//     success_url: `https://google.com`,
//     cancel_url: `https://google.com`,
//   });

//   res.status(200).json({ data: session });
// });

const createCheckoutSession = asyncHandler(async (req: any, res) => {
  const session = await paymentService.createCheckoutSession(
    req.user._id.toString(),
    req.body.orderId
  );

  res.status(200).json({ data: session });
});

export { createPayment, confirmPayment, createCheckoutSession };
