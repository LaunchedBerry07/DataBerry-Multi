#!/bin/bash

# Gmail Finance Manager - Google Cloud Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-""}
REGION=${GOOGLE_CLOUD_REGION:-"us-central1"}
SERVICE_NAME="gmail-finance-manager"
IMAGE_NAME="gmail-finance-manager"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    # Check if PROJECT_ID is set
    if [ -z "$PROJECT_ID" ]; then
        log_error "GOOGLE_CLOUD_PROJECT environment variable is not set."
        log_info "Please set it with: export GOOGLE_CLOUD_PROJECT=your-project-id"
        exit 1
    fi
    
    log_success "Requirements check passed"
}

authenticate() {
    log_info "Checking authentication..."
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_warning "No active authentication found. Starting authentication..."
        gcloud auth login
    fi
    
    # Set project
    gcloud config set project $PROJECT_ID
    log_success "Authentication configured for project: $PROJECT_ID"
}

enable_apis() {
    log_info "Enabling required Google Cloud APIs..."
    
    gcloud services enable \
        cloudbuild.googleapis.com \
        run.googleapis.com \
        artifactregistry.googleapis.com \
        secretmanager.googleapis.com
    
    log_success "APIs enabled successfully"
}

create_artifact_registry() {
    log_info "Creating Artifact Registry repository..."
    
    # Check if repository already exists
    if gcloud artifacts repositories describe $SERVICE_NAME --location=$REGION &>/dev/null; then
        log_warning "Artifact Registry repository already exists"
    else
        gcloud artifacts repositories create $SERVICE_NAME \
            --repository-format=docker \
            --location=$REGION \
            --description="Gmail Finance Manager container images"
        
        log_success "Artifact Registry repository created"
    fi
}

build_and_push_image() {
    log_info "Building and pushing Docker image..."
    
    # Configure Docker for Artifact Registry
    gcloud auth configure-docker $REGION-docker.pkg.dev
    
    # Build image
    docker build -t $IMAGE_NAME .
    
    # Tag image for Artifact Registry
    docker tag $IMAGE_NAME $REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME/$IMAGE_NAME:latest
    
    # Push image
    docker push $REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME/$IMAGE_NAME:latest
    
    log_success "Docker image built and pushed successfully"
}

deploy_cloud_run() {
    log_info "Deploying to Cloud Run..."
    
    gcloud run deploy $SERVICE_NAME \
        --image=$REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME/$IMAGE_NAME:latest \
        --platform=managed \
        --region=$REGION \
        --allow-unauthenticated \
        --port=8080 \
        --memory=512Mi \
        --cpu=1 \
        --min-instances=1 \
        --max-instances=10 \
        --set-env-vars="NODE_ENV=production" \
        --set-secrets="DATABASE_URL=database-url:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest,SESSION_SECRET=session-secret:latest"
    
    log_success "Cloud Run service deployed successfully"
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    log_success "Service URL: $SERVICE_URL"
}

setup_secrets() {
    log_info "Setting up secrets..."
    log_warning "Please ensure you have created the required secrets in Google Secret Manager:"
    log_warning "  - database-url: Your Neon Database connection string"
    log_warning "  - google-client-id: Your Google OAuth client ID"
    log_warning "  - google-client-secret: Your Google OAuth client secret"
    log_warning "  - session-secret: A secure session secret"
    log_info "You can create secrets with: gcloud secrets create SECRET_NAME --data-file=-"
}

main() {
    log_info "Starting Gmail Finance Manager deployment to Google Cloud..."
    
    check_requirements
    authenticate
    enable_apis
    setup_secrets
    create_artifact_registry
    build_and_push_image
    deploy_cloud_run
    
    log_success "Deployment completed successfully!"
    log_info "Your Gmail Finance Manager is now running on Google Cloud Run"
}

# Parse command line arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Gmail Finance Manager - Google Cloud Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy    Deploy the application (default)"
        echo "  build     Build and push Docker image only"
        echo "  secrets   Show secrets setup instructions"
        echo "  help      Show this help message"
        echo ""
        echo "Environment Variables:"
        echo "  GOOGLE_CLOUD_PROJECT  - Your Google Cloud Project ID (required)"
        echo "  GOOGLE_CLOUD_REGION   - Deployment region (default: us-central1)"
        ;;
    "build")
        check_requirements
        authenticate
        create_artifact_registry
        build_and_push_image
        ;;
    "secrets")
        setup_secrets
        ;;
    "deploy"|"")
        main
        ;;
    *)
        log_error "Unknown command: $1"
        log_info "Run '$0 help' for usage information"
        exit 1
        ;;
esac