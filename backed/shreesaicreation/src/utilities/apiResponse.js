export class AppError extends Error {
  constructor(message, status = 500, code, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message, errors) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

class ResponseBuilder {
  success(res, data, options = {}) {
    const response = {
      success: true,
      ...(data && typeof data === 'object' && !Array.isArray(data) ? data : { data }),
      ...(options.message && { message: options.message }),
      ...(options.meta && { meta: options.meta }),
    };

    return res.status(options.status || 200).json(response);
  }

  error(res, message, options = {}) {
    const response = {
      success: false,
      message,
      status: options.status || 500,
      ...(options.code && { code: options.code }),
      ...(options.errors && { errors: options.errors }),
      ...(options.details &&
        process.env.NODE_ENV === 'development' && { details: options.details }),
    };

    return res.status(options.status || 500).json(response);
  }
}

export function handleError(res, error) {
  if (error instanceof AppError) {
    return apiResponse.error(res, error.message, {
      status: error.status,
      code: error.code,
      errors: error instanceof ValidationError ? error.errors : undefined,
      details: error.details,
    });
  }

  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    return apiResponse.error(res, `Duplicate entry found for: ${field}`, {
      status: 409,
      code: 'DUPLICATE_ENTRY',
      details: { fields: [field] },
    });
  }

  if (error?.name === 'ValidationError') {
    const errors = Object.values(error.errors || {}).map((err) => err.message);
    return apiResponse.error(res, 'Validation Error', {
      status: 400,
      code: 'VALIDATION_ERROR',
      errors,
    });
  }

  if (error?.name === 'CastError') {
    return apiResponse.error(res, 'Invalid data format', {
      status: 400,
      code: 'INVALID_FORMAT',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }

  if (error instanceof Error) {
    return apiResponse.error(
      res,
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'An unexpected error occurred',
      {
        status: 500,
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }
    );
  }

  return apiResponse.error(res, 'An unexpected error occurred', {
    status: 500,
    code: 'UNKNOWN_ERROR',
  });
}

export async function handleApiRequest(req, res, handler) {
  try {
    const result = await handler(req, res);
    if (result === undefined) return;

    const data = Array.isArray(result) ? (result.length > 0 ? result[0] : null) : result;
    const message = Array.isArray(result)
      ? result.length > 1
        ? result[1]
        : null
      : undefined;
    const status = Array.isArray(result)
      ? result.length > 2
        ? result[2]
        : null
      : undefined;

    return apiResponse.success(res, data, {
      message: message || 'Request successful',
      status: status || 200,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export const apiResponse = new ResponseBuilder();
