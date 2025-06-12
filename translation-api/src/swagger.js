import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "1.0.0",
    title: "Translation Service API",
    description:
      "API for asynchronous text translation service using microservices architecture",
  },
  servers: [
    {
      url: "http://localhost:4040/",
      description: "Development server",
    },
  ],
  components: {
    schemas: {
      TranslationRequest: {
        text: "hello world",
        sourceLanguage: "en",
        targetLanguage: "pt"
      },
      TranslationResponse: {
        type: "object",
        properties: {
          requestId: {
            type: "string",
            description: "Unique identifier for the translation request",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          text: {
            type: "string",
            description: "Original text",
            example: "hello world",
          },
          sourceLanguage: {
            type: "string",
            description: "Source language code",
            example: "en",
          },
          targetLanguage: {
            type: "string",
            description: "Target language code",
            example: "pt",
          },
          status: {
            type: "string",
            description: "Translation status",
            enum: ["queued", "processing", "completed", "failed"],
            example: "completed",
          },
          translatedText: {
            type: "string",
            description:
              "Translated text (only present when status is completed)",
            example: "olá mundo",
          },
          error: {
            type: "string",
            description: "Error message (only present when status is failed)",
            example: "Translation failed: unable to translate text",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation timestamp",
            example: "2025-06-11T10:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update timestamp",
            example: "2025-06-11T10:00:05.000Z",
          },
          _links: {
            type: "array",
            items: { $ref: "#/components/schemas/Link" },
          },
        },
      },
      TranslationCreatedResponse: {
        type: "object",
        properties: {
          requestId: {
            type: "string",
            description: "Unique identifier for the translation request",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          status: {
            type: "string",
            description: "Translation status",
            example: "queued",
          },
          message: {
            type: "string",
            description: "Status message",
            example: "Translation request received and queued for processing",
          },
          _links: {
            type: "array",
            items: { $ref: "#/components/schemas/Link" },
          },
        },
      },
      TranslationUpdate: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["processing", "completed", "failed"],
            example: "completed",
          },
          text_translated: {
            type: "string",
            description: "Translated text",
            example: "olá mundo",
          },
          errorMessage: {
            type: "string",
            description: "Error message if translation failed",
            example: "Unable to translate text",
          },
        },
      },
      SupportedLanguages: {
        type: "object",
        properties: {
          languages: {
            type: "array",
            items: { type: "string" },
            example: ["en", "pt", "es"],
          },
          pairs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                from: { type: "string", example: "en" },
                to: { type: "string", example: "pt" },
                name: { type: "string", example: "English to Portuguese" },
              },
            },
          },
          examples: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { type: "string" },
            },
            example: {
              "en-pt": ["hello → olá", "world → mundo"],
              "pt-en": ["olá → hello", "mundo → world"],
            },
          },
          _links: {
            type: "array",
            items: { $ref: "#/components/schemas/Link" },
          },
        },
      },
      Link: {
        type: "object",
        properties: {
          rel: {
            type: "string",
            description: "Relationship type",
            example: "self",
          },
          href: {
            type: "string",
            description: "URL",
            example:
              "http://localhost:4040/api/translations/550e8400-e29b-41d4-a716-446655440000",
          },
          method: {
            type: "string",
            description: "HTTP method",
            example: "GET",
          },
          description: {
            type: "string",
            description: "Link description",
            example: "Get translation status",
          },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          code: {
            type: "string",
            example: "VALIDATION_ERROR",
          },
          message: {
            type: "string",
            example: "Validation failed",
          },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "sourceLanguage" },
                message: {
                  type: "string",
                  example: "Source language must be one of: en, pt, es",
                },
              },
            },
          },
        },
      },
      InternalServerError: {
        type: "object",
        properties: {
          code: {
            type: "string",
            example: "INTERNAL_SERVER_ERROR",
          },
          message: {
            type: "string",
            example: "An unexpected error occurred",
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
};

const outputFile = "./config/swagger.json";
const endpointsFiles = ["./routes.js"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc).then(
  async () => {
    await import("./server.js");
  }
);
