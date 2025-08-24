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

### Project Structure
- `src/` - Main application source code
  - `prisma/` - Prisma service and module for database access
  - `app.module.ts` - Root application module
  - `main.ts` - Application entry point (runs on port 3000)
- `prisma/` - Database schema and migrations
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

Note: The application currently has a basic Post model with id, title, content, published status, and creation timestamp.