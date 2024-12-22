# Backend Architecture Documentation

## Overview
This is a Node.js/Express backend application using Prisma ORM with PostgreSQL database. The architecture follows a clean, layered pattern with clear separation of concerns.

## Core Architecture Components

### 1. Application Structure
```
src/
├── controllers/    # Request handlers
├── services/      # Business logic
├── routes/        # API route definitions
├── middlewares/   # Express middlewares
├── utils/         # Helper utilities
├── config/        # Configuration files
└── server.js      # Application entry point
```

### 2. Key Technologies
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Yup schema validation
- **Security**: helmet, cors, rate limiting

### 3. Database Schema

The database consists of 6 main entities:
- User
- LoginSession
- Session
- Message
- Vendor
- Seller

Key relationships:
- User -> Sessions (1:M)
- Session -> Messages (1:M)
- Session -> Vendor (1:1)
- Session -> Sellers (1:M)

### 4. API Structure

The API follows RESTful conventions with these main endpoints:

```
/api/v1/
├── auth/          # Authentication routes
├── users/         # User management
├── sessions/      # Chat sessions
├── messages/      # Message handling
├── vendors/       # Vendor management
└── sellers/       # Seller management
```

## Security Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - Session management with login tracking

2. **Security Measures**
   - Rate limiting for API endpoints
   - CORS protection
   - HTTP security headers (via helmet)
   - Request size limiting
   - Password hashing with bcrypt

3. **Error Handling**
   - Global error handling middleware
   - Custom AppError class
   - Development/Production error responses

## Key Features

### 1. Authentication System
- Login/Logout functionality
- Token refresh mechanism
- Session tracking with device info

### 2. Session Management
- Unique session IDs using UUID
- Relationship tracking between users, messages, and vendors
- Title management for sessions

### 3. Message Handling
- Support for text and media messages
- Chronological message ordering
- Session-based message grouping

### 4. Vendor & Seller Management
- Vendor registration per session
- Seller product management
- Unique constraints for business rules

## Best Practices Implemented

1. **Code Organization**
   - Service layer pattern
   - Controller-Service separation
   - Route modularization

2. **Error Handling**
   - Async/await error catching
   - Validation error handling
   - Custom error classes

3. **Security**
   - Input validation
   - Rate limiting
   - Secure headers
   - Password hashing

4. **Performance**
   - Response compression
   - Database connection pooling
   - Efficient queries with Prisma

## Environment Configuration

Key environment variables required:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
NODE_ENV=development/production
PORT=3000
CORS_ORIGIN=*
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
BCRYPT_ROUNDS=10
```

## API Response Format
```json
{
  "status": "success/error",
  "message": "Operation result message",
  "data": {
    // Response data
  }
}
```

## Monitoring & Logging

1. **Error Tracking**
   - Uncaught exception handling
   - Unhandled promise rejection catching
   - Request timestamp tracking

2. **Logging**
   - Morgan for HTTP request logging
   - Development/Production log formats
   - Error stack traces in development

## Deployment Considerations

1. **Process Management**
   - Graceful shutdown handling
   - SIGTERM signal handling
   - Database connection management

2. **Security**
   - Environment-based error responses
   - Secure headers in production
   - Rate limiting configuration

3. **Performance**
   - Response compression
   - Static file serving
   - Error handling optimization