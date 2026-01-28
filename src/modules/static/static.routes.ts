import { Router } from "express";

import { sendSuccessPage, sendCancelPage } from "./static.controller";

const router = Router();

router.get(
  "/success",
  sendSuccessPage
);

router.get(
  "/cancel",
  sendCancelPage
);

export default router;
