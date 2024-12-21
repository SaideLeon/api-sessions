import { object, string } from 'yup';
import AppError from '../utils/AppError.mjs';

export const validate = (schema) => async (req, res, next) => {
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