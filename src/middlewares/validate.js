// src/middlewares/validate.js
import { AppError } from '../utils/AppError.js';

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    }, { abortEarly: false });
    next();
  } catch (err) {
    const errors = err.inner?.map((e) => ({
      field: e.path,
      message: e.message,
    })) || [{ message: err.message }];

    next(new AppError('Validation error', 400, errors));
  }
};
