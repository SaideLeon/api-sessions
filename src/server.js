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
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import winston from 'winston';
import { rateLimit } from 'express-rate-limit';

// Rotas
import userRoutes from './routes/userRoutes.mjs';
import { createNewSession, getUserSessions, getQrCode } from './routes/sessionsRoutes.mjs';
import messageRoutes from './routes/messageRoutes.mjs';
import vendorRoutes from './routes/vendorRoutes.mjs';
import sellerRoutes from './routes/sellerRoutes.mjs';
import authRoutes from './routes/authRoutes.mjs';

// Middlewares
import { errorHandler, notFound, handleUncaughtExceptions } from './middlewares/error.mjs';
import { limiter } from './middlewares/rateLimit.mjs';

// Configurações
config(); // Carrega variáveis de ambiente
const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Tratamento de exceções não capturadas
handleUncaughtExceptions();

class App {
  constructor() {
    this.app = express();
    this.server = null;
    this.io = null;
    this.sessions = new Map();
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.prisma = prisma;

    // Inicialização
    this.validateEnvironment();
    this.createServer();
    this.setupWebSocket();
    this.middlewares();
    this.routes();
    this.errorHandling();
  }

  validateEnvironment() {
    const requiredEnvVars = [
      'NODE_ENV',
      'PORT',
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_EXPIRES_IN',
      'CORS_ORIGIN'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        logger.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
      }
    }
  }

  createServer() {
    this.server = http.createServer(this.app);
    return this.server;
  }

  setupWebSocket() {
    this.io = new SocketServer(this.server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.io.on('connection', (socket) => {
      logger.info(`WebSocket client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${socket.id}`);
      });

      socket.on('error', (error) => {
        logger.error(`WebSocket error for client ${socket.id}:`, error);
      });
    });
  }

  middlewares() {
    // Configuração para proxies
    this.app.set('trust proxy', 1);

    // Segurança
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 86400
    }));
    
    // Rate limiting
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
          status: 'error',
          message: 'Too many requests, please try again later.'
        });
      }
    });
    this.app.use('/api/', apiLimiter);

    // Body parsing
    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // Compressão
    this.app.use(compression());

    // Logging
    if (this.isDevelopment) {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', {
        stream: { write: message => logger.info(message.trim()) }
      }));
    }

    // Arquivos estáticos
    this.app.use('/public', express.static(join(__dirname, '../public')));

    // Timestamp da requisição
    this.app.use((req, res, next) => {
      req.requestTime = new Date().toISOString();
      req.logger = logger;
      next();
    });
  }

  routes() {
    const apiV1 = '/api/v1';

    // Health check
    this.app.get(`${apiV1}/health`, (req, res) => {
      res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: req.requestTime,
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        websocket: this.io ? 'enabled' : 'disabled'
      });
    });

    // API routes
    this.app.use(`${apiV1}/users`, userRoutes);
    this.app.use(`${apiV1}/auth`, authRoutes);
    this.app.use(`${apiV1}/sessions`, createNewSession(this.io, this.sessions));
    this.app.use(`${apiV1}/sessions`, getQrCode(sessions));
    this.app.use(`${apiV1}/sessions`, getUserSessions);
    
    this.app.use(`${apiV1}/messages`, messageRoutes);
    this.app.use(`${apiV1}/vendors`, vendorRoutes);
    this.app.use(`${apiV1}/sellers`, sellerRoutes);

    // Handle undefined routes
    this.app.use(notFound);
  }

  errorHandling() {
    this.app.use(errorHandler);
  }

  async connectDatabase() {
    try {
      await this.prisma.$connect();
      logger.info('📦 Database connected successfully');
    } catch (error) {
      logger.error('❌ Database connection error:', error);
      throw error;
    }
  }

  async start() {
    try {
      await this.connectDatabase();
      
      const PORT = process.env.PORT || 3000;

      return new Promise((resolve) => {
        this.server.listen(PORT, () => {
          logger.info(`
🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}
⭐️ API URL: http://localhost:${PORT}${process.env.API_PREFIX || '/api/v1'}
📝 API Docs: http://localhost:${PORT}/api-docs
🔌 WebSocket enabled
          `);
          resolve(this.server);
        });
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      throw error;
    }
  }

  async stop() {
    if (this.io) {
      this.io.close();
    }
    
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(async () => {
          await this.prisma.$disconnect();
          logger.info('Server, WebSocket, and database connections closed');
          resolve();
        });
      });
    }
  }

  getServer() {
    return this.server;
  }

  getApp() {
    return this.app;
  }

  getIO() {
    return this.io;
  }
}

// Criação da instância
const appInstance = new App();

// Inicialização do servidor
const startServer = async () => {
  try {
    await appInstance.start();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Tratamento de erros não capturados
process.on('unhandledRejection', async (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  await appInstance.stop();
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  await appInstance.stop();
  process.exit(0);
});

// Tratamento de exceções não capturadas
process.on('uncaughtException', async (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  await appInstance.stop();
  process.exit(1);
});

export default appInstance.getApp();