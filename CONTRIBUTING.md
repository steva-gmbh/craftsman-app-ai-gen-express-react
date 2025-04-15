# Contributing to Craftsman App

This document provides a comprehensive overview of the Craftsman App architecture and development guidelines. It is intended to help new contributors understand the project structure and implementation details.

## Project Structure

The Craftsman App is a full-stack application built using a monorepo structure managed by Turborepo. The project is divided into two main modules:

1. **Backend Module**: A Node.js/Express application with TypeScript
2. **Frontend Module**: A React application with TypeScript and Vite

The project uses a modern build system with the following key components:
- **Turborepo**: For managing the monorepo and optimizing build processes
- **Vite**: For frontend development and building
- **TypeScript**: For type safety across both frontend and backend
- **Prisma**: For database ORM and migrations
- **Tailwind CSS**: For styling the frontend

## Backend Architecture

### Server Implementation

The backend is implemented as a RESTful API using Express.js with TypeScript. The server follows a modular architecture with clear separation of concerns:

- **Controllers**: Handle business logic and data processing
- **Routes**: Define API endpoints and middleware
- **Prisma**: Manages database operations and schema

The server is bootstrapped in `server.ts` and configured in `app.ts`, which sets up middleware, routes, and error handling.

### Domain Models and Database

The application uses Prisma as its ORM, which provides:
- Type-safe database access
- Automatic schema migrations
- Database seeding capabilities

Domain models are defined in the Prisma schema, which serves as the single source of truth for the database structure. The schema includes:
- Entity definitions
- Relationships between entities
- Field types and constraints

Database migrations are managed through Prisma's migration system, which:
- Tracks schema changes
- Generates migration files
- Provides rollback capabilities
- Ensures database consistency across environments

### API Design

The backend exposes a RESTful API with the following characteristics:
- Resource-oriented endpoints
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response format
- Proper error handling and status codes
- Input validation
- Authentication and authorization where required

### Testing Framework

The backend testing infrastructure uses a combined approach of unit testing with Jest and behavior-driven development (BDD) with Cucumber.js:

1. **Jest for Unit Testing**:
   - Located in `modules/backend/test/unit`
   - Tests individual components and functions in isolation
   - Fast execution for TDD workflows
   - Mocking capabilities for external dependencies
   - Coverage reporting

2. **Cucumber.js for BDD Testing**:
   - Located in `modules/backend/test/features`
   - Written in Gherkin syntax for human-readable specifications
   - Step definitions in `modules/backend/test/steps`
   - Support hooks in `modules/backend/test/support`
   - Focuses on testing behavior from user perspective

3. **Testing Structure**:
   - `features/`: Contains Gherkin feature files (.feature)
   - `steps/`: Contains step definitions implementing the Gherkin steps
   - `support/`: Contains hooks and world setup for test environment
   - `unit/`: Contains Jest unit tests

4. **Running Tests**:
   - `npm test`: Runs Jest unit tests
   - `npm run test:cucumber`: Runs Cucumber BDD tests
   - `npm run test:all`: Runs both test suites

5. **Test Conventions**:
   - Write unit tests for all controllers and services
   - Use Cucumber for API and integration tests
   - Maintain isolated test environments
   - Mock external dependencies
   - Use descriptive test and feature names

## Frontend Architecture

### Implementation Overview

The frontend is built using React with TypeScript and follows modern React patterns and best practices. The application structure includes:

- **Components**: Reusable UI elements
- **Pages**: Route-level components
- **Services**: API communication layer
- **Providers**: Context providers for state management
- **Hooks**: Custom React hooks for shared logic

### Shared CRUD Concepts

All CRUD (Create, Read, Update, Delete) views in the application share common patterns:

1. **State Management**:
   - Local state for form data
   - Global state for shared data
   - Loading and error states

2. **Form Handling**:
   - Controlled components
   - Form validation
   - Error feedback
   - Submission handling

3. **Data Fetching**:
   - Consistent API service usage
   - Loading states
   - Error handling
   - Data caching where appropriate

4. **UI Components**:
   - Consistent styling using Tailwind CSS
   - Reusable form components
   - Loading indicators
   - Error messages
   - Success notifications

### Backend Communication

The frontend communicates with the backend through a service layer that:

1. **API Services**:
   - Centralized API client configuration
   - Type-safe API calls
   - Request/response type definitions
   - Error handling

2. **Data Flow**:
   - Clear data transformation between frontend and backend
   - Type safety across the stack
   - Proper error propagation
   - Loading state management

3. **Authentication**:
   - Token management
   - Protected routes
   - User session handling

## Development Guidelines

When contributing to the project, please follow these guidelines:

1. **Code Style**:
   - Follow TypeScript best practices
   - Use consistent formatting
   - Write meaningful comments
   - Document complex logic

2. **Testing**:
   - Write tests for new features
   - Maintain test coverage
   - Test both frontend and backend changes
   - Use appropriate testing methodologies:
     - Unit tests for isolated functions and components
     - BDD tests for user-facing features
     - Integration tests for API endpoints

3. **Documentation**:
   - Update relevant documentation
   - Document API changes
   - Add comments for complex logic

4. **Version Control**:
   - Use meaningful commit messages
   - Create feature branches
   - Submit pull requests with clear descriptions

5. **Performance**:
   - Optimize database queries
   - Minimize frontend bundle size
   - Implement proper caching strategies

## Getting Started

To start contributing:

1. Clone the repository
2. Install dependencies using `npm install`
3. Set up the development environment
4. Run the development servers using the provided scripts
5. Make your changes following the guidelines above
6. Submit a pull request with a clear description of your changes

For more specific setup instructions, please refer to the README.md file. 