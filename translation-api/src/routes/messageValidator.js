import yup from "yup";

const supportedLanguages = ['en', 'pt', 'es'];

export default yup
  .object()
  .shape({
    text: yup
      .string()
      .min(1, "Text cannot be empty")
      .max(1000, "Text is too long (maximum 1000 characters)")
      .required("Text is required"),
    sourceLanguage: yup
      .string()
      .oneOf(supportedLanguages, `Source language must be one of: ${supportedLanguages.join(', ')}`)
      .required("Source language is required"),
    targetLanguage: yup
      .string()
      .oneOf(supportedLanguages, `Target language must be one of: ${supportedLanguages.join(', ')}`)
      .required("Target language is required")
      .test('different-languages', 'Source and target languages must be different', function(value) {
        return value !== this.parent.sourceLanguage;
      }),
    status: yup
      .string()
      .default("queued")    
  });
