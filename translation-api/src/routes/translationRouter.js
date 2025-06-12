import { Router } from "express";

import {
  getTranslationStatus,
  createTranslation,
  showAllMessages,
  updateTranslation,
  getSupportedLanguages
} from "../controllers/translationController.js";

import validator from "../middlewares/validator.js";
import schema from "./messageValidator.js";

const router = Router();

router.get("/languages", getSupportedLanguages);
router.post("/", validator(schema), createTranslation);
router.get("/:requestId", getTranslationStatus);
router.get("/", showAllMessages);
router.patch("/:requestId", updateTranslation);

export default router;
