import { Router } from "express";

import {
  showMessage,
  createMessage,
  showAllMessages,
  updateMessage
} from "../controllers/translationController.js";

import validator from "../middlewares/validator.js";
import schema from "./messageValidator.js";

const router = Router();
router.get("/:_id", showMessage);
router.get("/", showAllMessages);
router.post("/", validator(schema), createMessage);
router.patch("/:_id", updateMessage);

export default router;
