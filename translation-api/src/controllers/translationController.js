import Message from "../models/messageModel.js";
import publish from "../services/publish.js";
import { v4 as uuidv4 } from "uuid";

export const getTranslationStatus = async (req, res, next) => {
  /*
  #swagger.tags = ["Translations"]
  #swagger.responses[200]
  */

  try {
    const { requestId } = req.params;
    const translation = await Message.findOne({ requestId });

    if (!translation) {
      return res.status(404).json({ error: "Translation not found" });
    }

    const response = {
      requestId: translation.requestId,
      status: translation.status,
      text: translation.text,
      sourceLanguage: translation.sourceLanguage,
      targetLanguage: translation.targetLanguage,
      createdAt: translation.createdAt,
      updatedAt: translation.updatedAt
    };

    if (translation.status === "completed") {
      response.translatedText = translation.text_translated;
    }

    if (translation.status === "failed") {
      response.error = translation.errorMessage;
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const getSupportedLanguages = async (req, res, next) => {
  /*
  #swagger.tags = ["Translations"]
  #swagger.responses[200]
  */

  try {
    const supportedLanguages = {
      languages: ['en', 'pt', 'es'],
      pairs: [
        { from: 'en', to: 'pt', name: 'English to Portuguese' },
        { from: 'pt', to: 'en', name: 'Portuguese to English' },
        { from: 'en', to: 'es', name: 'English to Spanish' }
      ],
      examples: {
        'en-pt': ['hello → olá', 'world → mundo', 'thank you → obrigado'],
        'pt-en': ['olá → hello', 'mundo → world', 'obrigado → thank you'],
        'en-es': ['hello → hola', 'world → mundo', 'thank you → gracias']
      }
    };

    res.json(supportedLanguages);
  } catch (err) {
    next(err);
  }
};

export const showAllMessages = async (req, res, next) => {
  /*
  #swagger.tags = ["Translations"]
  #swagger.responses[200]
  */

  try {
    const translations = await Message.find();

    res.json(
      translations.map((translation) => ({
        requestId: translation.requestId,
        text: translation.text,
        translatedText: translation.text_translated,
        sourceLanguage: translation.sourceLanguage,
        targetLanguage: translation.targetLanguage,
        status: translation.status,
        createdAt: translation.createdAt,
        updatedAt: translation.updatedAt,
        links: [
          {
            rel: "self",
            href: `${process.env.SERVER}/api/translations/${translation.requestId}`,
            method: "GET",
          }
        ],
      }))
    );
  } catch (err) {
    next(err);
  }
};

export const createTranslation = async (req, res, next) => {
  /*
  #swagger.tags = ["Translations"]
  #swagger.requestBody = {
    required: true,
    schema: { $ref: "#/components/schemas/TranslationRequest" }
  }
  #swagger.responses[202]
  */

  try {
    const requestId = uuidv4();
    
    const translation = await new Message({
      requestId,
      text: req.body.text,
      sourceLanguage: req.body.sourceLanguage,
      targetLanguage: req.body.targetLanguage,
      status: "queued"
    }).save();

    await publish({
      requestId: translation.requestId,
      text: translation.text,
      sourceLanguage: translation.sourceLanguage,
      targetLanguage: translation.targetLanguage,
      callback: {
        href: `${process.env.SERVER}/api/translations/${translation.requestId}`,
        method: "PATCH",
      },
    });

    res.status(202).json({
      requestId: translation.requestId,
      status: "queued",
      message: "Translation request received and queued for processing"
    });
  } catch (err) {
    next(err);
  }
};

export const updateTranslation = async (req, res, next) => {
  /*
  #swagger.ignore = true
  */

  try {
    const { requestId } = req.params;
    
    const updateData = {};
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.text_translated) updateData.text_translated = req.body.text_translated;
    if (req.body.errorMessage) updateData.errorMessage = req.body.errorMessage;

    await Message.updateOne({ requestId }, updateData);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
