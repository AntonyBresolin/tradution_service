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
      return res.status(404).json({ 
        error: "Translation not found",
        _links: [
          { 
            rel: "create", 
            href: `${process.env.SERVER}/api/translations`, 
            method: "POST",
            description: "Create new translation"
          },
          { 
            rel: "list", 
            href: `${process.env.SERVER}/api/translations`, 
            method: "GET",
            description: "List all translations"
          }
        ]
      });
    }

    res.hateoas_translation(translation);
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

    res.hateoas_supported_languages(supportedLanguages);
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
    const page = parseInt(req.query._page) || 1;
    const size = parseInt(req.query._size) || 10;
    const skip = (page - 1) * size;

    const total = await Message.countDocuments();
    const totalPages = Math.ceil(total / size);
    
    const translations = await Message.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);

    res.hateoas_translations_list(translations, { totalPages });
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

    res.hateoas_translation_created(translation);
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
