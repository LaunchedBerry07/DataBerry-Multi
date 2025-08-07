# Overview

This is a Gmail Finance Manager application that helps users organize, categorize, and manage financial emails from their Gmail accounts. The application integrates with the Gmail API to fetch emails, automatically categorizes them (receipts, bills, statements, etc.), and provides tools for bulk operations, contact management, and data export. Built with a modern React frontend and Express.js backend, it features a comprehensive dashboard for email analysis and financial document management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and CSS variables
- **State Management**: TanStack React Query for server state and caching
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with organized route handlers
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)
- **Authentication**: Google OAuth 2.0 for Gmail API access

## Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon serverless driver with WebSocket support

## Project Structure
- **Monorepo Setup**: Shared schema and types between client and server
- **Client**: React application in `/client` directory
- **Server**: Express API in `/server` directory  
- **Shared**: Common schemas and types in `/shared` directory
- **Build Process**: Separate build processes for frontend (Vite) and backend (esbuild)

## Key Features Architecture
- **Gmail Integration**: OAuth flow with Gmail API for email fetching and categorization
- **Bulk Operations**: Batch job system for processing large sets of emails and contacts
- **Email Categorization**: Automatic classification of financial emails (receipts, bills, statements)
- **Contact Management**: Extract and manage contacts from email communications
- **Export System**: Multiple export formats (CSV, JSON, PDF) for data portability
- **Real-time Monitoring**: Job status tracking and progress reporting

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for database connectivity
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Unstyled, accessible UI component primitives
- **react-hook-form**: Form handling with validation
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation and type inference

## Authentication & External APIs
- **Google OAuth 2.0**: Gmail API authentication and authorization
- **Gmail API**: Email fetching, reading, and metadata extraction
- **Google Drive API**: Potential integration for attachment storage

## UI and Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant styling
- **lucide-react**: Icon library
- **date-fns**: Date manipulation and formatting

## Development Tools
- **vite**: Frontend build tool and development server
- **esbuild**: Backend bundling for production
- **tsx**: TypeScript execution for development
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development debugging tools

## Session and Security
- **connect-pg-simple**: PostgreSQL session store for Express
- **express-session**: Session management middleware
- **Environment Variables**: Secure configuration management for API keys and database credentials