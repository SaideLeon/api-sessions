{
  "name": "api-sessions",
  "version": "1.0.0",
  "description": "API for managing user sessions, messages, vendors and sellers",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "db:migrate": "prisma migrate deploy",
    "db:reset": "prisma migrate reset",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate",
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "@prisma/client": "^5.8.1",
    "bcrypt": "^5.1.1",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-async-errors": "^3.1.1",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "uuid": "^9.0.1",
    "yup": "^1.3.3"
  },
  "devDependencies": {
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "nodemon": "^3.0.2",
    "prisma": "^5.8.1",
    "supertest": "^6.3.3"
  }
}