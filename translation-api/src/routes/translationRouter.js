import { Router } from "express";

import {
  showMessage,
  createMessage,
} from "../controllers/translationController.js";

import validator from "../middlewares/validator.js";
import schema from "./messageValidator.js";

const router = Router();
router.get("/:_id", showMessage);
router.post("/", validator(schema), createMessage);
router.patch("/:_id", createMessage);

export default router;
