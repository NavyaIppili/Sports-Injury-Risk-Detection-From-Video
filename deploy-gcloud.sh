#!/bin/bash
# Deploy to Google Cloud Run script
# Prerequisites: 
#   - Google Cloud SDK installed and configured
#   - Project set up in Google Cloud Console
#   - Cloud Run and Cloud SQL APIs enabled
#   - Docker images built and ready

# Configuration
PROJECT_ID="${GCP_PROJECT_ID}"
REGION="${GCP_REGION:-us-central1}"
BACKEND_SERVICE_NAME="sports-injury-backend"
FRONTEND_SERVICE_NAME="sports-injury-frontend"
DATABASE_INSTANCE="${DB_INSTANCE_NAME:-sports-injury-db}"

if [ -z "$PROJECT_ID" ]; then
    echo "Error: GCP_PROJECT_ID environment variable not set"
    echo "Usage: GCP_PROJECT_ID=your-project REGION=us-central1 ./deploy-gcloud.sh"
    exit 1
fi

echo "======================================"
echo "Deploying to Google Cloud Run"
echo "======================================"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Set the project
gcloud config set project $PROJECT_ID

echo "Step 1: Building and pushing Docker images..."
echo ""

# Build backend image
echo "Building backend image..."
docker build -f backend/Dockerfile.cloud -t gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME:latest .
docker push gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME:latest

# Build frontend image
echo "Building frontend image..."
docker build -f frontend/Dockerfile.cloud -t gcr.io/$PROJECT_ID/$FRONTEND_SERVICE_NAME:latest frontend/
docker push gcr.io/$PROJECT_ID/$FRONTEND_SERVICE_NAME:latest

echo ""
echo "Step 2: Creating Cloud SQL instance..."
echo ""

# Check if Cloud SQL instance exists
if ! gcloud sql instances describe $DATABASE_INSTANCE --region=$REGION &> /dev/null; then
    echo "Creating Cloud SQL PostgreSQL instance: $DATABASE_INSTANCE"
    gcloud sql instances create $DATABASE_INSTANCE \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=$REGION \
        --root-password=$(openssl rand -base64 32)
    
    echo "Creating database..."
    gcloud sql databases create sports_injury_risk_detection --instance=$DATABASE_INSTANCE
else
    echo "Cloud SQL instance $DATABASE_INSTANCE already exists"
fi

echo ""
echo "Step 3: Deploying backend to Cloud Run..."
echo ""

# Get Cloud SQL connection name
DB_CONNECTION=$(gcloud sql instances describe $DATABASE_INSTANCE --format='value(connectionName)')
echo "Database connection string: $DB_CONNECTION"

# Deploy backend
gcloud run deploy $BACKEND_SERVICE_NAME \
    --image=gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME:latest \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --memory=2Gi \
    --cpu=1 \
    --timeout=300 \
    --set-env-vars="DATABASE_URL=postgresql://postgres:PASSWORD@/sports_injury_risk_detection?host=/cloudsql/$DB_CONNECTION,APP_ENV=production,SECRET_KEY=$(openssl rand -base64 32)" \
    --add-cloudsql-instances=$DB_CONNECTION

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE_NAME --platform=managed --region=$REGION --format='value(status.url)')
echo ""
echo "Backend deployed at: $BACKEND_URL"
echo ""

echo "Step 4: Deploying frontend to Cloud Run..."
echo ""

# Deploy frontend with backend URL
gcloud run deploy $FRONTEND_SERVICE_NAME \
    --image=gcr.io/$PROJECT_ID/$FRONTEND_SERVICE_NAME:latest \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --memory=512Mi \
    --cpu=1 \
    --timeout=300 \
    --set-env-vars="BACKEND_URL=$BACKEND_URL"

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --platform=managed --region=$REGION --format='value(status.url)')
echo ""
echo "Frontend deployed at: $FRONTEND_URL"
echo ""

echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo "Frontend URL: $FRONTEND_URL"
echo "Backend API URL: $BACKEND_URL"
echo "API Documentation: $BACKEND_URL/docs"
echo ""
echo "Note: You need to configure database password in Cloud SQL and update"
echo "the DATABASE_URL environment variable in the backend service."
echo ""
