import Payment from "../models/payment.model";
import paymentService from "../services/payment.service";

/**
 * Simulate a payment gateway callback
 */
export const processPayment = async (paymentId: string) => {
  console.log(`[WORKER] Processing payment ${paymentId}`);

  // Simulate gateway delay (2–5 seconds)
  const delay = Math.floor(Math.random() * 3000) + 2000;

  setTimeout(async () => {
    try {
      // Random success / failure (80% success)
      const isSuccess = Math.random() < 0.8;

      if (!isSuccess) {
        console.log(`[WORKER] Payment ${paymentId} FAILED`);

        await Payment.findByIdAndUpdate(paymentId, {
          status: "FAILED",
        });

        return;
      }

      console.log(`[WORKER] Payment ${paymentId} SUCCESS`);

      await paymentService.confirmPayment(paymentId);
    } catch (err) {
      console.error("[WORKER ERROR]", err);
    }
  }, delay);
};
