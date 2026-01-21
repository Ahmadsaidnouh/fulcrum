import { model, Schema } from "mongoose";

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    status: {
      type: String,
      enum: ["CREATED", "PAID", "CANCELLED", "SHIPPED"],
      default: "CREATED",
      index: true,
    },
  },
  { timestamps: true }
);

const Order = model("Order", orderSchema);

export default Order;
