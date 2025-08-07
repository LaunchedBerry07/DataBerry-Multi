# Gmail Finance Manager - Deployment Guide for Project "launchedberry"

## Your Configuration Summary

- **Project ID**: launchedberry
- **Region**: us-central1
- **Database**: Google Cloud SQL PostgreSQL
- **Instance**: launchedberry:us-central1:launchedberry-databerry-sql
- **OAuth**: Configured for Gmail API access

## Quick Deployment Steps

### 1. Set Up Google Cloud Secrets

Run these commands in Google Cloud Shell or with gcloud CLI:

```bash
# Set project
gcloud config set project launchedberry

# Create secrets for secure environment variables
echo "postgresql://postgres:StormyWarrior8*@35.232.144.197:5432/postgres?sslmode=require" | \
  gcloud secrets create database-url --data-file=-

echo "94103934446-nojqrs5mg1ui1lfbkqg2eni7d5vn4rgg.apps.googleusercontent.com" | \
  gcloud secrets create google-client-id --data-file=-

echo "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" | \
  gcloud secrets create google-client-secret --data-file=-

echo "8f2a9b4c6d1e7f3g5h9i2j4k6l8m0n3p5q7r9s1t4u6v8w0x2y4z6a8b0c2d4e6f8g" | \
  gcloud secrets create session-secret --data-file=-
```

### 2. Enable Required APIs

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    sqladmin.googleapis.com
```

### 3. Create Artifact Registry

```bash
gcloud artifacts repositories create gmail-finance-manager \
    --repository-format=docker \
    --location=us-central1 \
    --description="Gmail Finance Manager container images"
```

### 4. Build and Deploy

```bash
# Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build Docker image
docker build -t gmail-finance-manager .

# Tag for Artifact Registry
docker tag gmail-finance-manager \
  us-central1-docker.pkg.dev/launchedberry/gmail-finance-manager/gmail-finance-manager:latest

# Push image
docker push us-central1-docker.pkg.dev/launchedberry/gmail-finance-manager/gmail-finance-manager:latest

# Deploy to Cloud Run
gcloud run deploy gmail-finance-manager \
    --image=us-central1-docker.pkg.dev/launchedberry/gmail-finance-manager/gmail-finance-manager:latest \
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

### 5. Update OAuth Redirect URLs

After deployment, you'll get a Cloud Run URL like:
`https://gmail-finance-manager-xxx-uc.a.run.app`

Update your Google OAuth credentials:
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add the Cloud Run URL to both:
   - Authorized JavaScript origins: `https://your-cloud-run-url`
   - Authorized redirect URIs: `https://your-cloud-run-url/auth/google/callback`

## Alternative: Use Google Cloud Shell

If you don't have gcloud CLI locally, you can use Google Cloud Shell:

1. Go to https://console.cloud.google.com/
2. Click the Cloud Shell icon (terminal) in the top right
3. Clone or upload your project files
4. Run the deployment commands above

## Testing Your Deployment

After deployment:
1. Visit your Cloud Run URL
2. Test the health endpoint: `https://your-url/api/health`
3. Try the Gmail authentication flow
4. Verify database connectivity through the application

## Monitoring

- **Logs**: View in Cloud Run console or with `gcloud logs tail`
- **Metrics**: Monitor CPU, memory, and request metrics in Cloud Run
- **Health Checks**: Automatic monitoring via `/api/health` and `/api/ready`

Your application will automatically scale from 1-10 instances based on traffic and will be accessible worldwide with HTTPS by default.