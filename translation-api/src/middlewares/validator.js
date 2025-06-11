export default (schema) => (req, res, next) => {
  try {
    schema.validateSync(req.body, {
      abortEarly: false,
      recursive: true,
    });

    next();
  } catch (err) {
    schema
      .validate(req.body, {
        abortEarly: false,
        recursive: true,
      })
      .then(() => next())
      .catch((err) => {
        res.status(400).json({
          message: "Validation error",
          errors: err.errors,
        });
      });
  }
};
