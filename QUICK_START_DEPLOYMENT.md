# Quick Start Cloud Deployment Guide

## Choose Your Cloud Platform

### 1. Google Cloud Run (Recommended - Simplest)

```bash
# Setup
export GCP_PROJECT_ID=your-project-id
export GCP_REGION=us-central1

# Build images
docker build -f backend/Dockerfile.cloud -t sports-injury-backend:latest .
docker build -f frontend/Dockerfile.cloud -t sports-injury-frontend:latest frontend/

# Deploy
python3 deploy.py gcloud
# OR use the manual gcloud CLI commands in CLOUD_DEPLOYMENT_GUIDE.md
```

### 2. Azure Container Instances

```bash
# Follow detailed instructions in CLOUD_DEPLOYMENT_GUIDE.md
# Quick: Use Azure CLI to deploy containers to ACI
```

### 3. Simple VPS (DigitalOcean, Linode, AWS EC2)

```bash
# Build images locally
docker build -f backend/Dockerfile.cloud -t sports-injury-backend:latest .
docker build -f frontend/Dockerfile.cloud -t sports-injury-frontend:latest frontend/

# Push to VPS
docker save sports-injury-backend:latest | gzip > backend.tar.gz
docker save sports-injury-frontend:latest | gzip > frontend.tar.gz
scp *.tar.gz user@your-server.com:/home/user/

# On VPS
docker load -i backend.tar.gz
docker load -i frontend.tar.gz
docker-compose -f docker-compose.production.yml up -d
```

## Quick Commands

### Build Images
```bash
# Backend for cloud (uses port 8080)
docker build -f backend/Dockerfile.cloud -t sports-injury-backend:latest .

# Frontend for cloud (uses port 8080)
docker build -f frontend/Dockerfile.cloud -t sports-injury-frontend:latest frontend/
```

### Environment Configuration

Create `.env.production` with:
```env
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_NAME=sports_injury_risk_detection
APP_ENV=production
SECRET_KEY=your-random-secret-key
```

### Deployment Steps (Google Cloud Run)

1. **Setup Google Cloud**
   ```bash
   gcloud init
   gcloud auth login
   gcloud config set project PROJECT_ID
   gcloud services enable run.googleapis.com
   gcloud services enable sqladmin.googleapis.com
   ```

2. **Create Database**
   ```bash
   gcloud sql instances create sports-injury-db \
       --database-version=POSTGRES_15 \
       --tier=db-f1-micro \
       --region=us-central1
   ```

3. **Push Images**
   ```bash
   gcloud auth configure-docker gcr.io
   docker tag sports-injury-backend:latest gcr.io/PROJECT_ID/sports-injury-backend:latest
   docker push gcr.io/PROJECT_ID/sports-injury-backend:latest
   docker tag sports-injury-frontend:latest gcr.io/PROJECT_ID/sports-injury-frontend:latest
   docker push gcr.io/PROJECT_ID/sports-injury-frontend:latest
   ```

4. **Deploy Backend**
   ```bash
   gcloud run deploy sports-injury-backend \
       --image=gcr.io/PROJECT_ID/sports-injury-backend:latest \
       --platform=managed \
       --region=us-central1 \
       --allow-unauthenticated \
       --memory=2Gi \
       --cpu=1
   ```

5. **Deploy Frontend** (with backend URL)
   ```bash
   gcloud run deploy sports-injury-frontend \
       --image=gcr.io/PROJECT_ID/sports-injury-frontend:latest \
       --platform=managed \
       --region=us-central1 \
       --allow-unauthenticated \
       --memory=512Mi \
       --set-env-vars="BACKEND_URL=BACKEND_SERVICE_URL"
   ```

## Verify Deployment

```bash
# Manual testing
curl https://your-backend-url/health
curl https://your-frontend-url/

# Automated verification
python3 verify-deployment.py
# Follow prompts and enter your deployed URLs
```

## Files Included

### Docker Files (Cloud-Optimized)
- `backend/Dockerfile.cloud` - Backend image (listens on 8080)
- `frontend/Dockerfile.cloud` - Frontend image (listens on 8080)
- `frontend/docker-entrypoint.sh` - Entrypoint for frontend (handles env variables)

### Deployment Configuration
- `docker-compose.production.yml` - Production docker-compose for VPS
- `cloudbuild.yaml` - Google Cloud Build configuration
- `.gcloud/backend-service.yaml` - Backend Knative service spec
- `.gcloud/frontend-service.yaml` - Frontend Knative service spec
- `.gcloudignore` - Files to exclude from Cloud Build
- `.env.production` - Production environment template

### Deployment Scripts
- `deploy.py` - Interactive deployment script
- `deploy-gcloud.sh` - Google Cloud Run deployment script
- `verify-deployment.py` - Deployment verification script

### Documentation
- `CLOUD_DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- `DOCKER_SETUP.md` - Docker setup documentation
- `DOCKER_FILES_CHECKLIST.md` - Docker file reference

## Key Differences from Local Deployment

### Port Changes
- **Local**: Frontend on 3000, Backend on 8000
- **Cloud**: Both on 8080 (Cloud Run requirement)

### Environment Variables
- **Frontend**: `BACKEND_URL` set in Cloud Run environment
- **Backend**: `PORT` environment variable (defaults to 8080)
- **Database**: Cloud SQL connection string via environment

### Frontend API Communication
- **Local**: `http://localhost:8000`
- **Cloud**: Uses `BACKEND_URL` environment variable set in Cloud Run

## Troubleshooting

### Build Errors
```bash
# Re-build with no cache
docker build --no-cache -f backend/Dockerfile.cloud -t sports-injury-backend:latest .
```

### Deployment Errors
```bash
# Check Cloud Run logs
gcloud run logs read sports-injury-backend --region=us-central1

# Check services
gcloud run services list
```

### Connection Issues
```bash
# Test backend from frontend container
docker run -it sports-injury-frontend:latest sh
# curl http://backend:8000/health

# Test database connection
psql postgresql://user:pass@host:5432/db
```

## Cost Estimate

### Google Cloud Run
- **Free tier**: 2M requests/month
- **Typical project**: 2-5 GB/month = ~$0.30-0.75/month
- **Database**: $9.35/month (shared tier) + data transfer

### Azure Container Instances
- **Typical project**: ~$10-20/month

### VPS
- **Typical**: $5-20/month (fixed cost)

## Next Steps

1. Choose cloud platform
2. Follow Quick Start steps above
3. Run `python3 verify-deployment.py` to test
4. Access frontend URL from browser
5. Test login and core workflows

## Support

For detailed information, see:
- `CLOUD_DEPLOYMENT_GUIDE.md` - Full deployment guide
- `DOCKER_SETUP.md` - Docker configuration details
- Provider documentation:
  - Google Cloud: https://cloud.google.com/run/docs
  - Azure: https://docs.microsoft.com/en-us/azure/container-instances/
  - AWS: https://docs.aws.amazon.com/ecs/

