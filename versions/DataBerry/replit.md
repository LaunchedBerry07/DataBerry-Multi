# Gmail Finance Manager

## Overview

This is a full-stack web application that helps users manage financial emails from their Gmail accounts. The application provides features for organizing, filtering, and exporting financial communications like receipts, bills, statements, and invoices.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 25, 2025 - Google Cloud Infrastructure Deployment
✓ Configured complete Google Cloud Platform hosting and deployment infrastructure
✓ Created Docker containerization with multi-stage builds and security optimizations
✓ Implemented Cloud Build pipeline for automated CI/CD deployments
✓ Set up App Engine configuration with environment variables and scaling rules
✓ Added Terraform infrastructure-as-code for production-ready deployment
✓ Created deployment scripts for automated setup and maintenance
✓ Integrated health check endpoints for Cloud Run monitoring and scaling
✓ Configured Secret Manager for secure environment variable management

### January 25, 2025 - Bulk Email Processing and Batch Operations
✓ Added comprehensive bulk operations system for processing multiple emails and contacts
✓ Implemented batch job management with real-time progress tracking and status monitoring
✓ Created bulk email operations: categorize, label, export, delete, and sync multiple emails
✓ Built bulk contact operations: merge duplicates, categorize, sync, and cleanup old contacts
✓ Added advanced filtering criteria for bulk operations (date ranges, domains, categories)
✓ Integrated live progress monitoring with detailed operation logs and error handling
✓ Added operation templates for common bulk tasks
✓ Enhanced storage layer with batch processing capabilities and sample data

### January 25, 2025 - Replit Environment Migration
✓ Successfully migrated project from Replit Agent to standard Replit environment
✓ Verified all dependencies are properly installed and configured
✓ Confirmed Express server starts correctly on port 5000 with tsx hot reloading
✓ Validated React frontend connects properly with Vite development server
✓ Ensured proper client/server separation and security practices
✓ Authentication interface is accessible and functional

### January 24, 2025 - Modern Admin Dashboard Design Update
✓ Applied custom color scheme with purple, cyan, and pink gradients throughout the application
✓ Integrated user's custom app icon into authentication screen and dashboard branding
✓ Transformed the dashboard from horizontal tabs to modern sidebar navigation
✓ Updated all stat cards with gradient backgrounds, trend indicators, and modern shadows
✓ Redesigned quick filters with gradient buttons and improved visual hierarchy
✓ Modernized authentication screen with gradient backgrounds and feature highlights
✓ Enhanced labels grid with color-coded gradient cards and improved spacing
✓ Applied consistent modern card design across all components with shadow-modern styling

## System Architecture

### Frontend Architecture
The frontend is built with React and TypeScript, using a modern component-based architecture:
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
The backend follows a RESTful API pattern with Express.js:
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Google OAuth 2.0 for Gmail access
- **API Design**: RESTful endpoints with structured error handling

### Build System
- **Development**: Uses Vite dev server with HMR for frontend, tsx for backend hot reloading
- **Production**: Vite builds frontend to static assets, esbuild bundles backend
- **TypeScript**: Shared types between frontend and backend via `shared/` directory

## Key Components

### Authentication System
- Google OAuth 2.0 integration for Gmail access
- Stores access tokens and refresh tokens in PostgreSQL
- Gmail API integration for reading emails and managing labels

### Database Schema
The application uses the following main entities:
- **Users**: Stores user authentication data and Google tokens
- **Finance Labels**: Custom categorization labels for financial emails
- **Email Filters**: Automated rules for processing incoming emails
- **Financial Contacts**: Vendors, banks, and other financial entities
- **Financial Emails**: Processed email metadata and attachments
- **Export Jobs**: Background job tracking for data exports

### Email Processing
- Fetches emails from Gmail API using stored access tokens
- Categorizes emails automatically (receipts, bills, statements, invoices)
- Extracts and stores relevant metadata
- Manages email attachments and exports

### User Interface
- Dashboard with statistics and quick filters
- Label management for custom categorization
- Filter configuration for automated email processing
- Contact management for financial entities
- Export functionality for data and documents

## Data Flow

1. **Authentication**: User authenticates with Google OAuth, tokens stored in database
2. **Email Sync**: Application fetches emails from Gmail API using stored tokens
3. **Processing**: Emails are categorized and metadata extracted
4. **Storage**: Email data and metadata stored in PostgreSQL
5. **Display**: Frontend queries processed data via REST API
6. **Management**: Users can create labels, filters, and export data

## External Dependencies

### Google Services
- **Gmail API**: For reading emails and managing labels
- **Google OAuth 2.0**: For authentication and authorization
- **Google Identity Services**: For frontend authentication flow

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database queries and migrations

### Development Tools
- **Replit Integration**: Development environment optimizations
- **Hot Module Replacement**: Fast development feedback via Vite

## Deployment Strategy

### Development
- Frontend: Vite dev server with proxy to backend
- Backend: tsx for TypeScript execution with hot reloading
- Database: Connects to Neon Database via DATABASE_URL environment variable

### Production - Google Cloud Platform
- **Container**: Docker multi-stage builds with Node.js 20 Alpine base image
- **Hosting**: Google Cloud Run with automatic scaling (1-10 instances)
- **CI/CD**: Cloud Build pipeline triggered by Git commits
- **Infrastructure**: Terraform scripts for reproducible deployments
- **Secrets**: Google Secret Manager for secure environment variable storage
- **Monitoring**: Built-in health checks and logging integration
- **Database**: Production Neon Database instance with SSL connections

### Deployment Files
- `Dockerfile`: Multi-stage container build with security hardening
- `app.yaml`: App Engine configuration with auto-scaling
- `cloudbuild.yaml`: CI/CD pipeline for automated deployments
- `deploy.yaml`: Cloud Run service configuration
- `terraform/main.tf`: Infrastructure-as-code for complete GCP setup
- `scripts/deploy.sh`: Automated deployment script
- `README-DEPLOYMENT.md`: Comprehensive deployment guide

### Key Environment Variables
- `NODE_ENV`: Environment mode (development/production)
- `DATABASE_URL`: PostgreSQL connection string (required)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID (required for authentication)
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret (required)
- `SESSION_SECRET`: Secure session encryption key (required)

### Health Check Endpoints
- `/api/health`: Basic health status for load balancer checks
- `/api/ready`: Readiness probe for container startup verification

The application is optimized for Google Cloud Platform deployment with automatic scaling, secure secret management, and comprehensive monitoring capabilities.