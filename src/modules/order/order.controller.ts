import asyncHandler from "express-async-handler";

import Order from "../../models/order.model";
import orderService from "../../services/order.service";
import ApiError from "../../utils/apiError";

// @desc    CreateOrder
// @route   POST /api/v1/orders
// @access  Public
const createOrder = asyncHandler(async (req: any, res, next) => {
  // 1- Create order
  console.log("req.user._id = " + req.user);
  
  const order = await Order.create({
    userId: req.user._id,
    amount: req.body.amount,
    // status: req.body.status || "CREATED", // to enforce creation with "CREATED" status
  });

  // 2- Send response to client side
  res.status(201).json({ data: order });
});

// @desc    CancelOrder
// @route   POST /api/v1/orders/:id/cancel
// @access  Public
// const cancelOrder = asyncHandler(async (req: any, res, next) => {
//   const order = await Order.findById(req.params.id);

//   if (!order) {
//     return next(new ApiError("Order not found", 404));
//   }

//   if (order.status !== "CREATED") {
//     return next(new ApiError("Order cannot be cancelled", 400));
//   }

//   // Update the order status to CANCELLED
//   order.status = "CANCELLED";
//   await order.save();

//   // 4- Send response to client side
//   res.status(200).json({ data: order });
// });
const cancelOrder = asyncHandler(async (req: any, res) => {
  const order = await orderService.cancelOrder(
    req.user._id.toString(),
    req.params.id
  );

  res.status(200).json({ data: order });
});


export { createOrder, cancelOrder };
