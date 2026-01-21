import { model, Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    // orderId: { type: Schema.Types.ObjectId, ref: "Order", unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    amount: Number,
    // idempotencyKey: { type: String, unique: true, index: true },
    idempotencyKey: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * BUSINESS INVARIANT:
 * An order may have ONLY ONE active payment at a time.
 *
 * Active payments are defined as:
 * - PENDING
 * - SUCCESS
 *
 * FAILED and CANCELLED payments are excluded to allow retries.
 *
 * MongoDB enforces this as:
 * “For all payments where status ∈ [PENDING, SUCCESS],
 *  orderId must be unique.”
 *
 * This protects against race conditions and concurrent requests.
 */
paymentSchema.index(
  { orderId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["PENDING", "SUCCESS"] },
    },
  }
);

/**
 * IDEMPOTENCY GUARANTEE:
 * Ensures that the same idempotency key cannot create
 * multiple payments.
 *
 * Partial index is required because MongoDB treats `null`
 * as a value in unique indexes.
 *
 * This enforces uniqueness ONLY when the key exists.
 */
paymentSchema.index(
  { idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: { $exists: true },
    },
  }
);

const Payment = model("Payment", paymentSchema);

export default Payment;
