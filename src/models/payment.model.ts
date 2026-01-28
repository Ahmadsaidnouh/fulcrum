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
    provider: {
      type: String,
      enum: ["CASH", "STRIPE"],
      required: true,
      index: true,
    },
    externalRef: {
      type: String, // Stripe payment_intent or session ID
      // index: true,
    },
    paidAt: Date,
  },
  { timestamps: true },
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
  },
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
  },
);

/**
 * STRIPE IDEMPOTENCY GUARANTEE:
 * Ensures the same Stripe payment_intent/session
 * cannot be processed more than once.
 *
 * Stripe retries webhooks aggressively, so this
 * protects against duplicate payment creation.
 */
paymentSchema.index(
  { externalRef: 1 },
  {
    unique: true,
    partialFilterExpression: {
      externalRef: { $exists: true },
    },
  },
);

const Payment = model("Payment", paymentSchema);

export default Payment;
