import mongoose from "mongoose";
import Stripe from "stripe";

import Order from "../models/order.model";
import Payment from "../models/payment.model";
import ApiError from "../utils/apiError";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const createPayment = async function (
  userId: string,
  orderId: string,
  idempotencyKey: string
) {
  // Enhancement: see how to make this ATOMIC "wrap in one transaction"
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const order: any = await Order.findById(orderId).session(session);
    if (!order) throw new ApiError("Order not found", 404);

    if (order.userId.toString() !== userId) {
      throw new ApiError("You are not allowed to pay for this order", 403);
    }

    if (order.status !== "CREATED") {
      throw new ApiError("Order is not eligible for payment", 400);
    }

    // not needed now as the order uniquness is handled by the payment.index(orderId)
    //   const payment = await Payment.findOne({
    //     orderId,
    //     status: { $in: ["PENDING", "SUCCESS"] },
    //   });

    //   if (payment) {
    //     throw new ApiError("Payment already exists for this order", 400);
    //   }

    try {
      const [payment] = await Payment.create(
        [
          {
            orderId,
            amount: order.amount,
            status: "PENDING",
            ...(idempotencyKey && { idempotencyKey }), // include if only exists
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return payment;
    } catch (err: any) {
      console.log("err1 = " + err);

      if (err.code === 11000) {
        throw new ApiError("Payment already exists for this order", 400);
      }
      throw err;
      // this error will propagate to the outer try-catch
    }
  } catch (err) {
    console.log("err2 = " + err);

    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const confirmPayment = async (paymentId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) throw new ApiError("Payment not found", 404);

    // if (payment.status !== "PENDING") {
    //   throw new ApiError("Payment already processed", 400);
    // }

    // IDEMPOTENCY HANDLING
    if (payment.status === "SUCCESS") {
      // No-op: already confirmed
      console.log("Payment already confirmedd");
      await session.commitTransaction();
      session.endSession();
      return payment;
    }

    if (payment.status === "FAILED" || payment.status === "CANCELLED") {
      throw new ApiError(
        `Cannot confirm a ${payment.status.toLowerCase()} payment`,
        400
      );
    }

    // At this point status MUST be PENDING
    const order = await Order.findById(payment.orderId).session(session);
    if (!order) throw new ApiError("Order not found", 404);

    if (order.status !== "CREATED") {
      throw new ApiError("Order already processed", 400);
    }

    // ATOMIC UPDATE
    payment.status = "SUCCESS";
    order.status = "PAID";

    await payment.save({ session });
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return payment;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const failPayment = async (paymentId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) throw new ApiError("Payment not found", 404);

    // Idempotent behavior
    if (payment.status !== "PENDING") {
      console.log("Will do nothing");
      await session.commitTransaction();
      session.endSession();
      return payment;
    }

    payment.status = "FAILED";
    await payment.save({ session });

    await session.commitTransaction();
    session.endSession();

    return payment;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const createCheckoutSession = async (userId: string, orderId: string) => {
  const order: any = await Order.findById(orderId);
  if (!order) throw new ApiError("Order not found", 404);

  if (order.userId.toString() !== userId) {
    throw new ApiError("Unauthorized", 403);
  }

  if (order.status !== "CREATED") {
    throw new ApiError("Order not payable", 400);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_intent_data: {
      metadata: { orderId, userId },
    },
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: { name: "Order Payment" },
          unit_amount: order.amount * 100, // Stripe expects amount in cents
        },
        quantity: 1,
      },
    ],
//     // success_url: `${process.env.FRONTEND_URL}/success`,
//     // cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    success_url: `https://google.com`,
    cancel_url: `https://googlee.com`,
  });

  return session;
};

export default { createPayment, confirmPayment, failPayment, createCheckoutSession };
