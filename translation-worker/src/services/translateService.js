const translations = {
  'en-pt': {
    'hello': 'olá',
    'world': 'mundo',
    'good morning': 'bom dia',
    'good afternoon': 'boa tarde',
    'good evening': 'boa noite',
    'thank you': 'obrigado',
    'please': 'por favor',
    'yes': 'sim',
    'no': 'não',
    'how are you': 'como você está',
    'i love you': 'eu te amo',
    'cat': 'gato',
    'dog': 'cachorro',
    'house': 'casa',
    'car': 'carro',
    'food': 'comida',
    'water': 'água',
    'book': 'livro',
    'computer': 'computador',
    'phone': 'telefone',
    'beautiful': 'bonito'
  },
  'pt-en': {
    'olá': 'hello',
    'mundo': 'world',
    'bom dia': 'good morning',
    'boa tarde': 'good afternoon',
    'boa noite': 'good evening',
    'obrigado': 'thank you',
    'por favor': 'please',
    'sim': 'yes',
    'não': 'no',
    'como você está': 'how are you',
    'eu te amo': 'i love you',
    'gato': 'cat',
    'cachorro': 'dog',
    'casa': 'house',
    'carro': 'car',
    'comida': 'food',
    'água': 'water',
    'livro': 'book',
    'computador': 'computer',
    'telefone': 'phone',
    'bonito': 'beautiful'
  },
  'en-es': {
    'hello': 'hola',
    'world': 'mundo',
    'good morning': 'buenos días',
    'good afternoon': 'buenas tardes',
    'good evening': 'buenas noches',
    'thank you': 'gracias',
    'please': 'por favor',
    'yes': 'sí',
    'no': 'no',
    'how are you': 'cómo estás',
    'i love you': 'te amo',
    'cat': 'gato',
    'dog': 'perro',
    'house': 'casa',
    'car': 'coche',
    'food': 'comida',
    'water': 'agua',
    'book': 'libro',
    'computer': 'computadora',
    'phone': 'teléfono',
    'beautiful': 'hermoso'
  }
};

export const getSupportedLanguages = () => {
  return {
    supported_pairs: Object.keys(translations),
    languages: ['en', 'pt', 'es'],
    pairs: [
      { from: 'en', to: 'pt', name: 'English to Portuguese' },
      { from: 'pt', to: 'en', name: 'Portuguese to English' },
      { from: 'en', to: 'es', name: 'English to Spanish' }
    ]
  };
};

export const isLanguagePairSupported = (sourceLanguage, targetLanguage) => {
  const key = `${sourceLanguage.toLowerCase()}-${targetLanguage.toLowerCase()}`;
  return translations.hasOwnProperty(key);
};

export const translateText = async (text, sourceLanguage, targetLanguage) => {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Text is required and must be a string");
    }

    if (!sourceLanguage || typeof sourceLanguage !== "string") {
      throw new Error("Source language is required and must be a string");
    }

    if (!targetLanguage || typeof targetLanguage !== "string") {
      throw new Error("Target language is required and must be a string");
    }

    // Simular delay de processamento
    await new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 3000)
    );

    const translationKey = `${sourceLanguage.toLowerCase()}-${targetLanguage.toLowerCase()}`;
    const dictionary = translations[translationKey];

    if (!dictionary) {
      console.warn(
        `Translation pair ${sourceLanguage}-${targetLanguage} not supported, returning original text`
      );
      return `[UNSUPPORTED TRANSLATION: ${sourceLanguage} → ${targetLanguage}] ${text}`;
    }

    const lowerText = text.toLowerCase().trim();

    if (dictionary[lowerText]) {
      return dictionary[lowerText];
    }

    const words = lowerText.split(/\s+/); // Usar regex para lidar melhor com espaços
    const translatedWords = [];
    let translatedCount = 0;

    for (const word of words) {
      const punctuation = word.match(/[.,!?;:]+$/)?.[0] || "";
      const cleanWord = word.replace(/[.,!?;:]+$/, "");

      if (dictionary[cleanWord]) {
        translatedWords.push(dictionary[cleanWord] + punctuation);
        translatedCount++;
      } else {
        translatedWords.push(word);
      }
    }
    const result = translatedWords.join(" ");

    if (translatedCount > 0) {
      return result;
    }

    console.warn(`Could not translate any words in: "${text}"`);
    throw new Error(
      `TRANSLATION_FAILED: No translatable words found in text: "${text}". All words remain unchanged.`
    );
  } catch (error) {
    console.error("Error in translateText:", error.message);

    if (
      error.message.includes("required") ||
      error.message.includes("must be") ||
      error.message.includes("TRANSLATION_FAILED")
    ) {
      throw error;
    }

    return `[TRANSLATION ERROR: ${error.message}] ${text || "Unknown text"}`;
  }
};

export default {
  translateText,
  getSupportedLanguages,
  isLanguagePairSupported
};