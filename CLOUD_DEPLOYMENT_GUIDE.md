# Cloud Deployment Guide - Sports Injury Risk Detection Platform

This guide explains how to deploy the application to the cloud. Choose one of the deployment methods below based on your infrastructure.

## Table of Contents

1. [Google Cloud Run (Recommended - Simplest)](#google-cloud-run-recommended)
2. [Azure Container Instances](#azure-container-instances)
3. [Simple VPS Deployment](#simple-vps-deployment-with-docker-compose)
4. [AWS ECS](#aws-ecs)
5. [Deployment Verification](#deployment-verification)

---

## Google Cloud Run (Recommended)

Google Cloud Run is the **simplest and most cost-effective** option for this application. It provides serverless container deployment with automatic scaling.

### Prerequisites

- Google Cloud account (https://cloud.google.com)
- Google Cloud SDK installed (https://cloud.google.com/sdk/docs/install)
- Docker installed locally
- `gcloud` CLI configured with your project

### Step 1: Set up Google Cloud Project

```bash
# Create a new project (optional)
gcloud projects create sports-injury-detection --name="Sports Injury Detection"

# Set your project
export GCP_PROJECT_ID=sports-injury-detection
gcloud config set project $GCP_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Step 2: Configure Docker for Google Cloud

```bash
# Configure Docker to push to Google Container Registry
gcloud auth configure-docker gcr.io
```

### Step 3: Deploy Database (Cloud SQL)

```bash
export DB_INSTANCE_NAME="sports-injury-db"
export DB_REGION="us-central1"
export DB_PASSWORD=$(openssl rand -base64 32)

# Create PostgreSQL 15 instance
gcloud sql instances create $DB_INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$DB_REGION \
    --root-password=$DB_PASSWORD \
    --backup

# Create database
gcloud sql databases create sports_injury_risk_detection \
    --instance=$DB_INSTANCE_NAME

# Get connection string
export DB_CONN=$(gcloud sql instances describe $DB_INSTANCE_NAME --format='value(connectionName)')
echo "Database connection string: $DB_CONN"
echo "Store this for later: $DB_CONN"
```

### Step 4: Build and Push Docker Images

```bash
export PROJECT_ID=$GCP_PROJECT_ID
export REGION=$DB_REGION

# Build backend image
docker build \
    -f backend/Dockerfile.cloud \
    -t gcr.io/$PROJECT_ID/sports-injury-backend:latest .
docker push gcr.io/$PROJECT_ID/sports-injury-backend:latest

# Build frontend image
docker build \
    -f frontend/Dockerfile.cloud \
    -t gcr.io/$PROJECT_ID/sports-injury-frontend:latest \
    frontend/
docker push gcr.io/$PROJECT_ID/sports-injury-frontend:latest
```

### Step 5: Deploy Backend to Cloud Run

```bash
# Create a secret for database URL
echo "postgresql://postgres:$DB_PASSWORD@/sports_injury_risk_detection?host=/cloudsql/$DB_CONN" | \
    gcloud secrets create database-url --data-file=-

# Deploy backend service
gcloud run deploy sports-injury-backend \
    --image=gcr.io/$PROJECT_ID/sports-injury-backend:latest \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --memory=2Gi \
    --cpu=1 \
    --timeout=300 \
    --set-env-vars="APP_ENV=production,SECRET_KEY=$(openssl rand -base64 32),VIDEO_SAMPLE_INTERVAL=5,LOGIN_EMAIL=athlete@example.com,AUTO_CREATE_TABLES=true" \
    --set-secrets="DATABASE_URL=database-url:latest" \
    --add-cloudsql-instances=$DB_CONN \
    --service-account=default

# Get backend URL
export BACKEND_URL=$(gcloud run services describe sports-injury-backend \
    --platform=managed --region=$REGION --format='value(status.url)')
echo "Backend URL: $BACKEND_URL"
```

### Step 6: Deploy Frontend to Cloud Run

```bash
# Deploy frontend service with backend URL
gcloud run deploy sports-injury-frontend \
    --image=gcr.io/$PROJECT_ID/sports-injury-frontend:latest \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --memory=512Mi \
    --cpu=1 \
    --timeout=300 \
    --set-env-vars="BACKEND_URL=$BACKEND_URL"

# Get frontend URL
export FRONTEND_URL=$(gcloud run services describe sports-injury-frontend \
    --platform=managed --region=$REGION --format='value(status.url)')
echo "Frontend URL: $FRONTEND_URL"
```

### Access Your Application

- **Frontend**: `$FRONTEND_URL` (from above)
- **Backend API**: `$BACKEND_URL` (from above)
- **API Documentation**: `$BACKEND_URL/docs`

---

## Azure Container Instances

If you prefer Microsoft Azure, use Azure Container Instances with Azure Database for PostgreSQL.

### Prerequisites

- Azure account
- Azure CLI installed
- Docker installed

### Steps

```bash
# Set variables
export RESOURCE_GROUP="sports-injury-rg"
export CONTAINER_GROUP="sports-injury-containers"
export REGION="eastus"
export ACR_NAME="sportsinjuryacr"  # Must be globally unique

# Create resource group
az group create --name $RESOURCE_GROUP --location $REGION

# Create Container Registry
az acr create --resource-group $RESOURCE_GROUP \
    --name $ACR_NAME --sku Basic

# Login to ACR
az acr login --name $ACR_NAME

# Build and push backend image
docker build -f backend/Dockerfile.cloud \
    -t $ACR_NAME.azurecr.io/sports-injury-backend:latest .
docker push $ACR_NAME.azurecr.io/sports-injury-backend:latest

# Build and push frontend image
docker build -f frontend/Dockerfile.cloud \
    -t $ACR_NAME.azurecr.io/sports-injury-frontend:latest frontend/
docker push $ACR_NAME.azurecr.io/sports-injury-frontend:latest

# Create Azure Database for PostgreSQL
az postgres server create \
    --resource-group $RESOURCE_GROUP \
    --name sports-injury-db \
    --location $REGION \
    --admin-user postgres \
    --admin-password $(openssl rand -base64 32) \
    --sku-name B_Gen5_1 \
    --ssl-enforcement ENABLED

# Get database connection string
export DB_FQDN=$(az postgres server show --resource-group $RESOURCE_GROUP \
    --name sports-injury-db --query fullyQualifiedDomainName -o tsv)

# Deploy to Container Instances (see Azure documentation for detailed YAML config)
az container create --resource-group $RESOURCE_GROUP \
    --name sports-injury-backend \
    --image $ACR_NAME.azurecr.io/sports-injury-backend:latest \
    --cpu 1 --memory 2 \
    --environment-variables \
    DATABASE_URL="postgresql://..." \
    APP_ENV="production" \
    --registry-login-server $ACR_NAME.azurecr.io
```

---

## Simple VPS Deployment with Docker Compose

For a traditional server-based deployment (DigitalOcean, Linode, AWS EC2, etc.):

### Prerequisites

- VPS with Linux (Ubuntu 20.04 or later recommended)
- SSH access to server
- Docker and Docker Compose installed on server

### Step 1: Prepare Local Docker Images

```bash
# Build images locally
docker build -f backend/Dockerfile.cloud -t sports-injury-backend:latest .
docker build -f frontend/Dockerfile.cloud -t sports-injury-frontend:latest frontend/

# Save images to tar files
docker save sports-injury-backend:latest -o backend.tar
docker save sports-injury-frontend:latest -o frontend.tar
```

### Step 2: Upload to Server

```bash
# Copy files to server
scp backend.tar user@your-server.com:/home/user/
scp frontend.tar user@your-server.com:/home/user/
scp docker-compose.production.yml user@your-server.com:/home/user/docker-compose.yml
scp .env.production user@your-server.com:/home/user/.env
```

### Step 3: Deploy on Server

```bash
# SSH into server
ssh user@your-server.com

# Navigate to deployment directory
cd /home/user

# Load Docker images
docker load -i backend.tar
docker load -i frontend.tar

# Update environment variables
nano .env  # Edit with your configuration

# Start services
docker-compose -f docker-compose.yml up -d

# Verify services are running
docker-compose ps
docker-compose logs -f
```

### Step 4: Configure Nginx as Reverse Proxy (Optional)

For production, run Nginx as reverse proxy in front of frontend:

```bash
# Install Nginx
sudo apt-get update
sudo apt-get install -y nginx

# Configure Nginx (example)
sudo tee /etc/nginx/sites-available/default > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## AWS ECS

For AWS Elastic Container Service deployment:

### Prerequisites

- AWS account
- AWS CLI configured
- Docker installed

### Steps (Simplified)

```bash
# Create ECR repositories
aws ecr create-repository --repository-name sports-injury-backend
aws ecr create-repository --repository-name sports-injury-frontend

# Push images to ECR
# (see AWS ECR documentation for detailed push commands)

# Create RDS PostgreSQL instance
aws rds create-db-instance \
    --db-instance-identifier sports-injury-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username postgres

# Create ECS cluster and services
# (see AWS ECS documentation for task definitions and services)
```

---

## Deployment Verification

### 1. Check Frontend Accessibility

```bash
# Test frontend (replace with your actual URL)
curl -I https://your-frontend-url.example.com/
# Should return 200 OK
```

### 2. Check Backend API

```bash
# Test backend health check
curl https://your-backend-url.example.com/health
# Should return: {"status": "healthy"}
```

### 3. Test Login Workflow

```bash
# Test authentication endpoint
curl -X POST https://your-backend-url.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "athlete@example.com", "password": "password"}'
# Should return login response
```

### 4. Frontend to Backend Communication

1. Open frontend URL in browser
2. Try to log in with test credentials
3. Check browser console for any errors
4. Verify network requests to backend are successful

### 5. Check Service Health

```bash
# For Google Cloud Run
gcloud run services describe sports-injury-backend --platform=managed
gcloud run services describe sports-injury-frontend --platform=managed

# For Docker containers
docker-compose ps  # Should show all services as running
docker-compose logs --follow
```

---

## Troubleshooting

### Frontend Cannot Connect to Backend

1. **Check BACKEND_URL environment variable**
   ```bash
   # Should be set to backend service URL
   echo $BACKEND_URL
   ```

2. **Check Nginx configuration**
   ```bash
   curl -v https://your-frontend-url.example.com/api/health
   ```

3. **Check CORS settings in backend**
   - Ensure CORS allows requests from frontend domain
   - In `app/main.py`, update allowed origins if needed

### Database Connection Issues

1. **Verify database is running**
   ```bash
   # For Cloud SQL
   gcloud sql instances list
   gcloud sql instances describe sports-injury-db
   
   # For Docker
   docker-compose logs db
   ```

2. **Check DATABASE_URL is correct**
   ```bash
   echo $DATABASE_URL
   ```

3. **Test database connection**
   ```bash
   psql $DATABASE_URL -c "SELECT version();"
   ```

### Image Build Failures

1. **Check Docker image locally**
   ```bash
   docker images
   docker inspect image_name
   ```

2. **Re-build image**
   ```bash
   docker build --no-cache -f Dockerfile.cloud -t name:latest .
   ```

3. **Check build logs**
   ```bash
   docker logs container_id
   ```

---

## Cost Optimization

### Google Cloud Run

- **Free tier**: 2M requests/month
- **Pricing**: $0.00001667 per GB-second + compute resource time
- **Cost**: Usually < $5/month for small projects

### Azure Container Instances

- **Pricing**: $0.0000225 per GB-second
- **Cost**: Usually < $10/month for small projects

### VPS (DigitalOcean, Linode)

- **Starting price**: $5-10/month for basic droplet
- **Cost**: Predictable fixed monthly cost

---

## Production Best Practices

1. **Use managed databases** (Cloud SQL, RDS, Azure Database)
   - Automatic backups
   - High availability
   - Security patches

2. **Enable HTTPS/SSL**
   - Use Let's Encrypt for free certificates
   - Or use cloud provider's managed SSL

3. **Set strong secrets**
   ```bash
   # Generate strong random values
   openssl rand -base64 32  # For SECRET_KEY
   openssl rand -base64 32  # For DB_PASSWORD
   ```

4. **Configure monitoring and logging**
   - Enable application logs
   - Set up alerts for errors
   - Monitor database performance

5. **Use environment-specific configurations**
   - Different secrets per environment
   - Different database instances
   - Different resource limits

6. **Implement CI/CD pipeline**
   - Automated builds on git push
   - Automated testing
   - Automated deployment

7. **Regular backups**
   - Database backups (automated)
   - Application backups
   - Configuration backups

---

## Next Steps

1. Choose your deployment method (Google Cloud Run recommended)
2. Follow the steps for your chosen platform
3. Verify deployment using the verification steps
4. Configure monitoring and logging
5. Set up automated backups
6. Plan for scaling as needed

---

## Support and Resources

- **Google Cloud Run**: https://cloud.google.com/run/docs
- **Azure Container Instances**: https://docs.microsoft.com/en-us/azure/container-instances/
- **AWS ECS**: https://docs.aws.amazon.com/ecs/
- **Docker**: https://docs.docker.com/
- **PostgreSQL**: https://www.postgresql.org/docs/

For project-specific issues:
1. Check service logs
2. Review environment variables
3. Verify database connectivity
4. Test API endpoints manually
