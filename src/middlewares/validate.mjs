
// src/middlewares/validate.mjs
import { object, string } from 'yup';
import AppError from '../utils/AppError.mjs';

const auth = {
  login: object({
    body: object({
      email: string().email().required().label('Email'),
      password: string().required().min(6).label('Password')
    })
  })
};

const user = {
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
};

const session = {
    create: object({
        body: object({
            userId: string().required(),
            title: string().min(3).max(100).optional()
        })
    }),
    update: object({
        body: object({
            title: string().min(3).max(100).required()
        })
    })
};

const message = {
  create: object({
    body: object({
      sessionId: string().required(),
      sender: string().required(),
      content: string().required(),
      phoneNumber: string().required(),
      mediaUrl: string().url().nullable()
    })
  })
};

const vendor = {
  create: object({
    body: object({
      sessionId: string().required(),
      phoneNumber: string().required(),
      vendorName: string().required()
    })
  })
};

const seller = {
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
};

const schemas = {
  auth,
  user,
  session,
  message,
  vendor,
  seller
};

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    throw new AppError(err.message, 400);
  }
};

export { validate, schemas };