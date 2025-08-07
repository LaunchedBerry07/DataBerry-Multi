# Gmail Finance Manager - Google Cloud Deployment Guide

This guide explains how to deploy the Gmail Finance Manager application to Google Cloud Platform using Cloud Run and related services.

## Prerequisites

1. **Google Cloud Account**: Active GCP account with billing enabled
2. **Google Cloud CLI**: Install the `gcloud` CLI tool
3. **Docker**: Install Docker for building container images
4. **Node.js**: Node.js 20+ for local development

## Deployment Options

### Option 1: Quick Deployment (Recommended)

Use the provided deployment script for automated setup:

```bash
# Set your Google Cloud project ID
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Make the script executable
chmod +x scripts/deploy.sh

# Run the deployment
./scripts/deploy.sh
```

### Option 2: Manual Deployment

#### 1. Enable Required APIs

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com
```

#### 2. Create Secrets

Create the required secrets in Google Secret Manager:

```bash
# Database URL (Neon or other PostgreSQL)
echo "postgresql://user:password@host:port/database?sslmode=require" | \
  gcloud secrets create database-url --data-file=-

# Google OAuth credentials
echo "your-google-client-id.apps.googleusercontent.com" | \
  gcloud secrets create google-client-id --data-file=-

echo "your-google-client-secret" | \
  gcloud secrets create google-client-secret --data-file=-

# Session secret (generate a secure random string)
echo "your-secure-session-secret-at-least-32-characters" | \
  gcloud secrets create session-secret --data-file=-
```

#### 3. Create Artifact Registry

```bash
gcloud artifacts repositories create gmail-finance-manager \
    --repository-format=docker \
    --location=us-central1 \
    --description="Gmail Finance Manager container images"
```

#### 4. Build and Deploy

```bash
# Build the application
npm run build

# Build Docker image
docker build -t gmail-finance-manager .

# Tag for Artifact Registry
docker tag gmail-finance-manager \
  us-central1-docker.pkg.dev/YOUR_PROJECT_ID/gmail-finance-manager/gmail-finance-manager:latest

# Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev

# Push image
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/gmail-finance-manager/gmail-finance-manager:latest

# Deploy to Cloud Run
gcloud run deploy gmail-finance-manager \
    --image=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/gmail-finance-manager/gmail-finance-manager:latest \
    --platform=managed \
    --region=us-central1 \
    --allow-unauthenticated \
    --port=8080 \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=1 \
    --max-instances=10 \
    --set-env-vars="NODE_ENV=production" \
    --set-secrets="DATABASE_URL=database-url:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest,SESSION_SECRET=session-secret:latest"
```

### Option 3: Infrastructure as Code (Terraform)

For production deployments, use Terraform for infrastructure management:

```bash
cd terraform

# Copy and edit variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your actual values

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply infrastructure
terraform apply
```

## Configuration

### Environment Variables

The application requires these environment variables:

- `NODE_ENV`: Set to "production"
- `DATABASE_URL`: PostgreSQL connection string (from Neon or other provider)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `SESSION_SECRET`: Secure session encryption key

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized JavaScript origins: `https://your-cloud-run-url`
   - Authorized redirect URIs: `https://your-cloud-run-url/auth/google/callback`

### Database Setup

The application works with any PostgreSQL database. For Neon Database:

1. Create account at [Neon](https://neon.tech/)
2. Create a new database
3. Copy the connection string
4. Add to Google Secret Manager as `database-url`

## Monitoring and Maintenance

### Health Checks

The application provides health check endpoints:
- `/api/health`: Basic health status
- `/api/ready`: Readiness probe for startup

### Logging

View application logs:
```bash
gcloud logs tail --follow --project=YOUR_PROJECT_ID \
  --resource-type=cloud_run_revision \
  --resource-labels-service-name=gmail-finance-manager
```

### Scaling

Cloud Run automatically scales based on traffic. Configure scaling:
```bash
gcloud run services update gmail-finance-manager \
  --region=us-central1 \
  --min-instances=0 \
  --max-instances=20
```

### Updates

Deploy updates by rebuilding and pushing the image:
```bash
./scripts/deploy.sh build
```

## Cost Optimization

1. **Cold Start Optimization**: Set min-instances to 0 for cost savings
2. **Resource Limits**: Adjust memory and CPU based on actual usage
3. **Request Timeout**: Set appropriate timeout values
4. **Database Connection Pooling**: Use connection pooling for database efficiency

## Security Considerations

1. **Secret Management**: All sensitive data stored in Google Secret Manager
2. **IAM Permissions**: Least privilege access for service accounts
3. **HTTPS Only**: Cloud Run enforces HTTPS by default
4. **VPC Connectivity**: Optional VPC connector for database access
5. **Authentication**: Implement proper user authentication and session management

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Node.js version compatibility
2. **Secret Access**: Verify IAM permissions for secret access
3. **Database Connection**: Ensure database URL is correct and accessible
4. **OAuth Errors**: Verify redirect URIs match deployed URL

### Debugging

```bash
# View service details
gcloud run services describe gmail-finance-manager --region=us-central1

# Check logs
gcloud logs read --project=YOUR_PROJECT_ID \
  --resource-type=cloud_run_revision \
  --resource-labels-service-name=gmail-finance-manager

# Test health endpoint
curl https://YOUR_SERVICE_URL/api/health
```

## Support

For deployment issues:
1. Check the application logs in Google Cloud Console
2. Verify all secrets are properly configured
3. Ensure Google OAuth is set up with correct redirect URIs
4. Test database connectivity from Cloud Shell

The application is now ready for production use on Google Cloud Platform!