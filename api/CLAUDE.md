# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run start:dev` - Run the application in development mode with hot reload
- `npm run start:prod` - Run in production mode (includes Prisma migrations, generation, and seeding)
- `npm run build` - Build the application using NestJS CLI
- `npm run format` - Format TypeScript files with Prettier

### Testing
- `npm run test` - Run unit tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:debug` - Debug tests with Node.js inspector

### Code Quality
- `npm run lint` - Lint and fix TypeScript files with ESLint

### Database Operations
- `npx prisma migrate dev` - Create and apply new migrations
- `npx prisma generate` - Generate Prisma client
- `npx prisma db seed` - Seed the database
- `npx prisma migrate deploy` - Apply migrations in production

## Architecture Overview

### Framework & Stack
- **NestJS**: TypeScript framework for building scalable server-side applications
- **Prisma**: Database ORM with PostgreSQL as the database
- **Docker**: Containerized development environment with PostgreSQL service
- **Azure Blob Storage**: Cloud storage service for user-uploaded images and files

### Project Structure
- `src/` - Main application source code
  - `prisma/` - Prisma service and module for database access
  - `users/storage/` - User image storage module with Azure Blob Storage integration
  - `app.module.ts` - Root application module
  - `main.ts` - Application entry point (runs on port 3000)
- `prisma/` - Database schema, migrations, and seed data
- `test/` - End-to-end test files
- `generated/prisma/` - Auto-generated Prisma client (gitignored)

### Database Configuration
- Uses PostgreSQL as the primary database
- Custom Prisma client output location: `../generated/prisma`
- Database connection via `DATABASE_URL` environment variable
- Docker setup provides development database on port 5434

### Key Integration Points
- **PrismaService**: Extends PrismaClient, available as injectable service
- **PrismaModule**: Exports PrismaService for use across the application
- **Docker Compose**: Provides `tradepal-dev-db` PostgreSQL container and `tradepal-api` application container

### Development Environment
- Husky for Git hooks
- ESLint + Prettier for code formatting
- Jest for testing with TypeScript support
- Hot reload enabled in development mode

### Production Deployment
The `start:prod` script handles the full production startup sequence:
1. Deploy pending migrations
2. Generate Prisma client
3. Run database seeding
4. Start the application

## Image Storage System

### Azure Blob Storage Integration
The application includes a comprehensive image storage system using Azure Blob Storage for user avatars:

- **UserStorageModule**: Scalable module for image upload and management
- **Direct Upload Support**: Frontend can upload directly to Azure using presigned URLs (recommended)
- **Traditional Backend Upload**: Files can still be uploaded through the backend
- **Automatic image replacement**: New uploads automatically replace previous user images
- **Presigned URLs**: Secure temporary URLs for both upload (15min) and access (1-hour expiration)
- **File validation**: Supports JPEG, PNG, WebP with 5MB size limit (enforced client-side for direct uploads)
- **Private storage**: Images require presigned URLs for access, enhancing security

### Image Storage Commands

#### Direct Upload Flow (Recommended)
- `POST /users/:id/avatar/upload-url` - Generate presigned URL for direct upload to Azure (expires in 15 minutes)
- `POST /users/:id/avatar/confirm` - Confirm upload completion and update database with new image URL

#### Traditional Upload Flow
- `POST /users/:id/avatar` - Upload user avatar image through backend

#### Access Flow
- `GET /users/:id/avatar/presigned-url` - Get temporary access URL for user avatar (expires in 1 hour)

### Environment Variables Required
```bash
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_storage_account_key
AZURE_STORAGE_CONTAINER_NAME=your_container_name
```

### Data Models
- **User**: Contains `imageUrl` field for storing Azure Blob Storage URLs
- **Post**: Basic blog post model with title, content, published status, and author relationship