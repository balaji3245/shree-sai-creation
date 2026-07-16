import { ValidationError, handleError } from '../utilities/apiResponse.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        throw new ValidationError(
          'Validation failed',
          error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          }))
        );
      }

      req[source] = value;
      next();
    } catch (err) {
      return handleError(res, err);
    }
  };
}
