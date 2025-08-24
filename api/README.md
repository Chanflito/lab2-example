# Example - NestJS Application

A modern, scalable REST API built with NestJS, TypeScript, and Prisma ORM.

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

## 🚀 Quick Start

### Local Development

For local development, we run the database in Docker and the NestJS application locally.

1. **Start the database with Docker:**
   ```bash
   # Start only the database service
   docker-compose up -d db
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your local database configuration
   # Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/api_db"
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # Seed the database (optional)
   npx prisma db seed
   ```

5. **Start the development server:**
   ```bash
   npm run start:dev
   ```

6. **The API will be available at:**
   - Application: `http://localhost:3000`
   - Database: `localhost:5432` (running in Docker)

## 📁 Project Example Structure

Following NestJS best practices with clean architecture, the project is organized as follows:

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Application entry point
├── 
├── common/                    # Shared utilities, guards, interceptors
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── filters/
│
├── config/                    # Configuration modules
│   ├── database.config.ts
│   ├── app.config.ts
│   └── validation.schema.ts
│
├── modules/                   # Feature modules
│   │
│   └── [feature]/             # Other feature modules
│       ├── controllers/
│       │   └── [feature].controller.ts
│       ├── services/
│       │   ├── [feature].service.ts
│       │   └── [feature].service.interface.ts
│       ├── repositories/
│       │   ├── [feature].repository.ts
│       │   └── [feature].repository.interface.ts
│       ├── dto/               # Data Transfer Objects
│       │   ├── create-[feature].dto.ts
│       │   ├── update-[feature].dto.ts
│       │   └── [feature]-response.dto.ts
│       ├── entities/          # Database entities/models
│       │   └── [feature].entity.ts
│       └── [feature].module.ts
│
├── prisma/                    # Database layer
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
└── shared/                    # Shared modules and services
    ├── logger/
    └── utils/

prisma/
├── schema.prisma              # Database schema
├── migrations/                # Database migrations
└── seed.ts                    # Database seeding
```

## 🏗️ Architecture Pattern Implementation

We follow the **Repository Pattern** and **Dependency Injection** principles to ensure clean, testable, and maintainable code.

### Repository Pattern Example

Each module follows this structure with interfaces for better testability and loose coupling:

#### Repository Interface (`repositories/component.repository.interface.ts`)
```typescript
import { Component } from "@prisma/client";

export abstract class IComponentRepository {
  abstract createComponent(
    name: string,
  ): Promise<boolean>;
}
```

#### Repository Implementation (`repositories/component.repository.ts`)
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Component } from "@prisma/client";
import { PrismaService } from '../../prisma/prisma.service';
import { IComponentRepository } from './component.repository.interface';

@Injectable()
export class ComponentRepository implements IComponentRepository {
  constructor(@Inject(PrismaService) private readonly db: PrismaService) {}

  async createComponent(name: string): Promise<boolean> {
    // Implementation here...
  }
}
```

#### Service Interface (`services/component.service.interface.ts`)
```typescript
import { Component } from "@prisma/client";
import { CreateComponentDto } from '../dto/create-component.dto';

export abstract class IComponentService {
  abstract createComponent(createComponentDto: CreateComponentDto): Promise<Component>;
}
```

#### Service Implementation (`services/component.service.ts`)
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Component } from "@prisma/client";
import { IComponentService } from './component.service.interface';
import { IComponentRepository } from '../repositories/component.repository.interface';
import { CreateComponentDto } from '../dto/create-component.dto';

@Injectable()
export class ComponentService implements IComponentService {
  constructor(
    @Inject('IComponentRepository')
    private readonly componentRepository: IComponentRepository,
  ) {}

  async createComponent(createComponentDto: CreateComponentDto): Promise<Component> {
    // Implementation here...
  }
}
```

#### Controller (controllers/component.controller.ts)
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Inject } from '@nestjs/common';
import { IComponentService } from '../services/component.service.interface';
import { CreateComponentDto } from '../dto/create-component.dto';
import { UpdateComponentDto } from '../dto/update-component.dto';

@Controller('components')
export class ComponentController {
  constructor(
    @Inject('IComponentService')
    private readonly componentService: IComponentService,
  ) {}

  @Post()
  async createComponent(@Body() createComponentDto: CreateComponentDto) {
    // Implementation here...
  }

}
```

#### Module Configuration
```typescript
import { Module } from '@nestjs/common';
import { ComponentController } from './controllers/component.controller';
import { ComponentService } from './services/component.service';
import { ComponentRepository } from './repositories/component.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ComponentController],
  providers: [
    {
      provide: 'IComponentService',
      useClass: ComponentService,
    },
    {
      provide: 'IComponentRepository',
      useClass: ComponentRepository,
    },
  ],
  exports: ['IComponentService'],
})
export class ComponentModule {}
```

## 🛠️ Available Scripts

### Development
```bash
# Start in development mode with hot reload
npm run start:dev

# Start in debug mode
npm run start:debug

# Build the application
npm run build

# Start in production mode
npm run start:prod
```

### Database
```bash
# Generate Prisma client
npx prisma generate

# Create and apply a new migration
npx prisma migrate dev --name <migration-name>

# Apply pending migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```

### Code Quality
```bash
# Lint and fix code
npm run lint

# Format code
npm run format
```

## 🐳 Docker Commands

### For Local Development (Database Only)
```bash
# Start only the database service
docker-compose up -d db
```

### Database Operations in Container
```bash
# Run migrations in local development (when app runs locally)
npx prisma migrate dev
```

## 📝 Environment Variables

Create a `.env` file in the root directory with the following variables:

### For Local Development (Database in Docker, App Local)
```env
# Database (Docker container)
DATABASE_URL="postgresql://postgres:password@localhost:5432/api_db"

# Application (running locally)
PORT=3000
NODE_ENV=development

# JWT 
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Other service configurations...
```

### For Full Docker Deployment
```env
# Database (Docker internal network)
DATABASE_URL="postgresql://postgres:password@db:5432/api_db"

# Application
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=7d
```

## 🏗️ Module Structure Best Practices

When creating new modules, follow this structure:

1. **Controllers** (`controllers/`): Handle HTTP requests and responses (no interfaces needed)
2. **Services** (`services/`): Business logic with interfaces for dependency injection
3. **Repositories** (`repositories/`): Data access layer with interfaces
4. **DTOs** (`dto/`): Data Transfer Objects for request/response validation
5. **Entities** (`entities/`): Database models or TypeScript interfaces
6. **Module** (`*.module.ts`): Module configuration and dependency injection

### Example Module Creation:

```bash
# Generate a new module structure
nest g module modules/posts
nest g controller modules/posts/controllers/posts
nest g service modules/posts/services/posts

# Then manually create the interfaces and repository files
```

## 🧪 Testing Strategy

The architecture supports easy unit testing through dependency injection:

```typescript
// Example unit test for service
describe('AccountService', () => {
  let service: AccountService;
  let mockRepository: jest.Mocked<IAccountRepository>;

  beforeEach(async () => {
    mockRepository = {
      createAccount: jest.fn(),
      checkIfWalletExists: jest.fn(),
      getAccountByWalletAddress: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: 'IAccountRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  // Test cases...
});
```

- **Unit Tests**: Test individual components in isolation using mocked dependencies
- **Integration Tests**: Test module interactions
- **E2E Tests**: Test complete user flows
- **Database Tests**: Test repository implementations

## 📚 API Documentation

- **Swagger Documentation**: Available at `http://localhost:3000/api` (when running)
- **Postman Collection**: Import the collection from `/docs/postman/`

## 🔒 Security Features

- Input validation with class-validator
- Request rate limiting
- CORS configuration
- Environment-based configuration
- SQL injection prevention with Prisma

### Environment-specific configurations:
- Development: `docker-compose.yml`
- Production: `docker-compose.prod.yml`

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Docker Documentation](https://docs.docker.com/)