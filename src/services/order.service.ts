import Order from "../models/order.model";
import ApiError from "../utils/apiError";

const cancelOrder = async function (userId: string, orderId: string) {
  const order : any = await Order.findById(orderId);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  if (order.userId.toString() !== userId) {
    throw new ApiError("You are not allowed to cancel this order", 403);
  }

  if (order.status !== "CREATED") {
    throw new ApiError("Order cannot be cancelled", 400);
  }

  order.status = "CANCELLED";
  return order.save();
}

export default { cancelOrder };