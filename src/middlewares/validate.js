// src/middlewares/validate.js
import { object, string } from 'yup';
import { AppError } from '../utils/AppError.js';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware de validação para schemas.
 * @param {Object} schema - Esquema de validação (Yup).
 * @returns {Function} Middleware para validar requisições.
 */
export const validate = (schema) => async (req, res, next) => {
  try {
    // Validação do esquema fornecido
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    }, { abortEarly: false }); // Garante que todos os erros sejam capturados
    next();
  } catch (err) {
    // Mensagens de erro detalhadas
    const errors = err.inner?.map((e) => ({
      field: e.path,
      message: e.message,
    })) || [{ message: err.message }];

    next(new AppError('Validation error', 400, errors));
  }
};


// Schemas de validação
export const schemas = {
  user: {
    create: object({
      body: object({
        username: string().required().min(3),
        email: string().email().required(),
        password: string().required().min(6),
        phoneNumber: string().required().min(10)
      })
    }),
    update: object({
      body: object({
        username: string().min(3),
        email: string().email(),
        phoneNumber: string().min(10)
      })
    })
  },
  session: {
    create: object({
      body: object({
        userId: string().required()
      })
    })
  },
  message: {
    create: object({
      body: object({
        sessionId: string().required(),
        sender: string().required(),
        content: string().required(),
        phoneNumber: string().required(),
        mediaUrl: string().url().nullable()
      })
    })
  },
  vendor: {
    create: object({
      body: object({
        sessionId: string().required(),
        phoneNumber: string().required(),
        vendorName: string().required()
      })
    })
  },
  seller: {
    create: object({
      body: object({
        sessionId: string().required(),
        sellerName: string().required(),
        product: string().required(),
        description: string().required(),
        benefits: string().required(),
        image: string().url().nullable()
      })
    })
  }
};