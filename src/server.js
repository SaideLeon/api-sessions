// src/server.js
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Rotas
import userRoutes from './routes/userRoutes.mjs';
import sessionRoutes from './routes/sessionRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';

// Middlewares
import { errorHandler, notFound, handleUncaughtExceptions } from './middlewares/error.mjs';
import { limiter } from './middlewares/rateLimit.mjs';

// Configurações
config(); // Carrega variáveis de ambiente
const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tratamento de exceções não capturadas
handleUncaughtExceptions();

class App {
  constructor() {
    this.app = express();
    this.isDevelopment = process.env.NODE_ENV === 'development';

    this.middlewares();
    this.routes();
    this.errorHandling();
    this.database();
  }

  middlewares() {
    // Configuração para proxies (necessária para express-rate-limit)
    this.app.set('trust proxy', 1);

    // Segurança
    this.app.use(helmet()); // Segurança com headers HTTP
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    this.app.use(limiter); // Rate limiting

    // Body parsing
    this.app.use(express.json({ limit: '10kb' })); // Limita tamanho do body
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // Compressão de resposta
    this.app.use(compression());

    // Logging
    if (this.isDevelopment) {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Servir arquivos estáticos (se necessário)
    this.app.use('/public', express.static(join(__dirname, '../public')));

    // Timestamp da requisição
    this.app.use((req, res, next) => {
      req.requestTime = new Date().toISOString();
      next();
    });
  }

  routes() {
    // Health check
    this.app.get('/api/v1/health', (req, res) => {
      res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: req.requestTime,
        environment: process.env.NODE_ENV
      });
    });

    // API routes
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/sessions', sessionRoutes);
    this.app.use('/api/v1/messages', messageRoutes);
    this.app.use('/api/v1/vendors', vendorRoutes);
    this.app.use('/api/v1/sellers', sellerRoutes);

    // Handle undefined routes
    this.app.use(notFound);
  }

  errorHandling() {
    // Middleware global de tratamento de erros
    this.app.use(errorHandler);
  }

  async database() {
    try {
      await prisma.$connect();
      console.log('📦 Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection error:', error);
      process.exit(1);
    }
  }

  getApp() {
    return this.app;
  }
}

// Instância do servidor
const app = new App().getApp();

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`
🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}
⭐️ API URL: http://localhost:${PORT}/api/v1
📝 API Docs: http://localhost:${PORT}/api-docs
  `);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('💥 Process terminated!');
    process.exit(0);
  });
});

export default app;
