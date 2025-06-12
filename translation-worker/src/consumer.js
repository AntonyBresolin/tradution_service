import dotenv from "dotenv";
import colors from "colors";
import connection from "./services/connection.js";
import { translateText, isLanguagePairSupported } from "./services/translateService.js";

dotenv.config();

const queue = "message_translation";
const exchange = "message_translation_exchange";
const routingKey = "message";

connection(queue, exchange, routingKey, async (task) => {
  console.log(colors.blue("==> Processando tradução:"), task.data);
  
  const { requestId, text, sourceLanguage, targetLanguage, callback } = task.data;
  
  try {
    if (!requestId || !text || !sourceLanguage || !targetLanguage || !callback) {
      throw new Error("Dados incompletos na mensagem: requestId, text, sourceLanguage, targetLanguage e callback são obrigatórios");
    }

    console.log(colors.yellow("===> Marcando como 'processing'"));
    await updateTranslationStatus(callback, {
      status: 'processing'
    });

    if (!isLanguagePairSupported(sourceLanguage, targetLanguage)) {
      console.log(colors.yellow(`===> Par de idiomas ${sourceLanguage}-${targetLanguage} não é totalmente suportado, mas tentando tradução...`));
    }

    console.log(colors.yellow("===> Realizando tradução..."));
    const translatedText = await translateText(text, sourceLanguage, targetLanguage);
    
    const isPartialTranslation = translatedText.includes('[PARTIAL TRANSLATION]') || 
                                translatedText.includes('[UNSUPPORTED TRANSLATION]');
    const isErrorTranslation = translatedText.includes('[TRANSLATION ERROR]');

    if (isErrorTranslation) {
      console.log(colors.red("===> Erro na tradução, marcando como failed"));
      await updateTranslationStatus(callback, {
        status: 'failed',
        errorMessage: `Translation failed: ${translatedText}`
      });
    } else {
      console.log(colors.green("===> Tradução concluída, atualizando status"));
      await updateTranslationStatus(callback, {
        status: 'completed',
        text_translated: translatedText
      });

      if (isPartialTranslation) {
        console.log(colors.yellow("====> Atenção: Tradução parcial realizada"));
      }
    }

    console.log(colors.green("====> Tradução processada com sucesso!"));
    console.log(colors.green(`Original: ${text}`));
    console.log(colors.green(`Traduzido: ${translatedText}`));
    
  } catch (error) {
    console.log(colors.red("===> Erro no processamento:"), error.message);
    
    const isValidationError = error.message.includes('required') || 
                             error.message.includes('must be') ||
                             error.message.includes('Dados incompletos');
    
    if (isValidationError) {
      console.log(colors.red("====> Erro de validação - marcando como failed sem retry"));
      try {
        await updateTranslationStatus(callback, {
          status: 'failed',
          errorMessage: `Validation error: ${error.message}`
        });
      } catch (updateError) {
        console.log(colors.red("====> Erro ao atualizar status:"), updateError.message);
      }
      
      return;
    }
    
    try {
      await updateTranslationStatus(callback, {
        status: 'failed',
        errorMessage: `Processing error: ${error.message}`
      });
    } catch (updateError) {
      console.log(colors.red("====> Erro ao atualizar status:"), updateError.message);
    }
    
    throw error;
  }
});

async function updateTranslationStatus(callback, data) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await fetch(callback.href, {
        method: callback.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(colors.green(`Status atualizado para: ${data.status}`));
      return;
      
    } catch (error) {
      attempt++;
      console.log(colors.yellow(`Tentativa ${attempt}/${maxRetries} de atualizar status falhou:`, error.message));
      
      if (attempt === maxRetries) {
        throw new Error(`Falha ao atualizar status após ${maxRetries} tentativas: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
