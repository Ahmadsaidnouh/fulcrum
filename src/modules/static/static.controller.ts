import asyncHandler from "express-async-handler";

import ApiError from "../../utils/apiError";

const sendSuccessPage = asyncHandler(async (req: any, res) => {
  // Render success page with payment details
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Thanks for your order!</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <section>
    <p>
      We appreciate your business! If you have any questions, please email
      <a href="mailto:orders@example.com">orders@example.com</a>.
    </p>
  </section>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
});

const sendCancelPage = asyncHandler(async (req: any, res) => {
  // Render cancel page with payment details
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Checkout canceled</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <section>
    <p>Forgot to add something to your cart? Shop around then come back to pay!</p>
  </section>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
});

export { sendSuccessPage, sendCancelPage };
