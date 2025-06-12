export default (req, res, next) => {
  /*
  #swagger.ignore = true
  */
  
  res.hateoas_translation = (translation) => {
    const links = [
      { 
        rel: "self", 
        href: `${process.env.SERVER}/api/translations/${translation.requestId}`, 
        method: "GET",
        description: "Get translation status"
      },
      { 
        rel: "list", 
        href: `${process.env.SERVER}/api/translations`, 
        method: "GET",
        description: "List all translations"
      },
      { 
        rel: "languages", 
        href: `${process.env.SERVER}/api/translations/languages`, 
        method: "GET",
        description: "Get supported languages"
      }
    ];

    // Adicionar link para criar nova tradução apenas se status for final
    if (translation.status === 'completed' || translation.status === 'failed') {
      links.push({
        rel: "create-new",
        href: `${process.env.SERVER}/api/translations`,
        method: "POST",
        description: "Create new translation"
      });
    }

    const response = {
      requestId: translation.requestId,
      status: translation.status,
      text: translation.text,
      sourceLanguage: translation.sourceLanguage,
      targetLanguage: translation.targetLanguage,
      createdAt: translation.createdAt,
      updatedAt: translation.updatedAt,
      _links: links
    };

    if (translation.status === "completed") {
      response.translatedText = translation.text_translated;
    }

    if (translation.status === "failed") {
      response.error = translation.errorMessage;
    }

    res.ok(response);
  };

  res.hateoas_translations_list = (translations, pagination = {}) => {
    const page = parseInt(req.query._page) || 1;
    const size = parseInt(req.query._size) || 10;
    const totalPages = pagination.totalPages || 1;

    const response = {
      data: translations.map((translation) => ({
        requestId: translation.requestId,
        text: translation.text,
        translatedText: translation.text_translated,
        sourceLanguage: translation.sourceLanguage,
        targetLanguage: translation.targetLanguage,
        status: translation.status,
        createdAt: translation.createdAt,
        updatedAt: translation.updatedAt,
        _links: [
          { 
            rel: "self", 
            href: `${process.env.SERVER}/api/translations/${translation.requestId}`, 
            method: "GET",
            description: "Get translation details"
          }
        ]
      })),
      _pagination: {
        current: page,
        total: totalPages,
        size: translations.length,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      },
      _links: [
        { 
          rel: "self", 
          href: `${process.env.SERVER}/api/translations`, 
          method: "GET",
          description: "Current page"
        },
        { 
          rel: "create", 
          href: `${process.env.SERVER}/api/translations`, 
          method: "POST",
          description: "Create new translation"
        },
        { 
          rel: "languages", 
          href: `${process.env.SERVER}/api/translations/languages`, 
          method: "GET",
          description: "Get supported languages"
        }
      ]
    };

    if (page > 1) {
      response._links.push({
        rel: "previous",
        href: `${process.env.SERVER}/api/translations?_page=${page - 1}&_size=${size}`,
        method: "GET",
        description: "Previous page"
      });
    }

    if (page < totalPages) {
      response._links.push({
        rel: "next",
        href: `${process.env.SERVER}/api/translations?_page=${page + 1}&_size=${size}`,
        method: "GET",
        description: "Next page"
      });
    }

    res.ok(response);
  };

  res.hateoas_translation_created = (translation) => {
    const response = {
      requestId: translation.requestId,
      status: "queued",
      message: "Translation request received and queued for processing",
      _links: [
        { 
          rel: "self", 
          href: `${process.env.SERVER}/api/translations/${translation.requestId}`, 
          method: "GET",
          description: "Check translation status"
        },
        { 
          rel: "list", 
          href: `${process.env.SERVER}/api/translations`, 
          method: "GET",
          description: "List all translations"
        },
        { 
          rel: "languages", 
          href: `${process.env.SERVER}/api/translations/languages`, 
          method: "GET",
          description: "Get supported languages"
        }
      ]
    };

    res.status(202).json(response);
  };

  res.hateoas_supported_languages = (languagesData) => {
    const response = {
      ...languagesData,
      _links: [
        { 
          rel: "self", 
          href: `${process.env.SERVER}/api/translations/languages`, 
          method: "GET",
          description: "Supported languages"
        },
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
    };

    res.ok(response);
  };

  next();
}
