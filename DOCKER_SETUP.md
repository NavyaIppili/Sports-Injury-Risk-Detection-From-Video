# Docker Setup Guide

This guide explains how to run the Sports Injury Risk Detection platform using Docker.

## Prerequisites

- Docker Desktop installed and running (Docker 20.10+)
- Docker Compose (usually included with Docker Desktop)
- At least 4GB of available RAM
- Ports 3000, 8000, and 5432 available on your machine

## Quick Start

### 1. Build the Docker Images

From the project root directory, run:

```bash
docker compose build
```

This will build three images:
- `frontend` - Vite React application served with Nginx
- `backend` - FastAPI application
- `db` - PostgreSQL database (official image, no build needed)

### 2. Start the Services

Run:

```bash
docker compose up
```

Or run in the background with:

```bash
docker compose up -d
```

### 3. Access the Application

Once all services are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432 (for database tools)

### 4. Check Service Status

To see the status of all services:

```bash
docker compose ps
```

To view logs:

```bash
docker compose logs -f
```

To view logs for a specific service:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

## Configuration

### Environment Variables

The `.env.docker` file contains all environment variables used by Docker Compose. You can customize:

```env
# Database Configuration
DB_USER=username
DB_PASSWORD=password
DB_NAME=sports_injury_risk_detection

# Backend Configuration
APP_ENV=production
SECRET_KEY=your-secret-key-change-this-in-production

# Video Processing
VIDEO_SAMPLE_INTERVAL=5

# Authentication
LOGIN_EMAIL=athlete@example.com
```

To use a custom environment file:

```bash
docker compose --env-file .env.custom up
```

## Services

### Database (PostgreSQL)

- **Container Name**: `sports-injury-db`
- **Port**: 5432
- **Initial Database**: `sports_injury_risk_detection`
- **Persistence**: Data is stored in `postgres_data` Docker volume

### Backend (FastAPI)

- **Container Name**: `sports-injury-backend`
- **Port**: 8000
- **Health Check**: http://localhost:8000/health
- **Endpoints**:
  - Authentication: `/api/v1/auth/*`
  - Profile: `/api/v1/athlete/profile/*`
  - Videos: `/api/v1/videos/*`
  - Analysis: Various endpoints
  - Dashboard: `/dashboard/*`

### Frontend (Nginx)

- **Container Name**: `sports-injury-frontend`
- **Port**: 3000
- **Proxy**: API requests to backend at `http://backend:8000`

## Troubleshooting

### Container Fails to Start

Check the logs:

```bash
docker compose logs -f <service-name>
```

Common issues:
- Port already in use: Change port mappings in `docker-compose.yml`
- Database not ready: Wait for database health check to pass
- Missing dependencies: Run `docker compose build` again

### Database Connection Issues

Ensure the database is healthy:

```bash
docker compose ps
# Look for "healthy" status on the db service
```

If the database isn't healthy:

```bash
docker compose restart db
docker compose logs -f db
```

### Frontend Cannot Connect to Backend

1. Check backend is running: `docker compose ps`
2. Check backend logs: `docker compose logs backend`
3. Verify API URL in frontend: Should be `http://localhost:8000`
4. Check browser console for CORS errors

### Rebuilding After Code Changes

For frontend changes:

```bash
docker compose build frontend
docker compose up frontend -d
```

For backend changes:

```bash
docker compose build backend
docker compose up backend -d
```

For all changes:

```bash
docker compose build
docker compose up -d
```

## Stopping Services

Stop all services:

```bash
docker compose stop
```

Stop and remove containers (data in volumes persists):

```bash
docker compose down
```

Stop, remove containers AND volumes (clears database):

```bash
docker compose down -v
```

## Database Management

### Access Database via CLI

```bash
docker compose exec db psql -U username -d sports_injury_risk_detection
```

### Backup Database

```bash
docker compose exec db pg_dump -U username sports_injury_risk_detection > backup.sql
```

### Restore Database

```bash
docker compose exec -T db psql -U username sports_injury_risk_detection < backup.sql
```

## Production Considerations

For production deployment:

1. **Update SECRET_KEY** in `.env.docker` to a strong random value
2. **Change default credentials** for database (DB_USER, DB_PASSWORD)
3. **Set APP_ENV=production** to disable debug mode
4. **Configure CORS properly** in backend for your domain
5. **Use environment-specific configs** - don't use `.env.docker` directly
6. **Enable HTTPS** - add SSL configuration to Nginx
7. **Set resource limits** in `docker-compose.yml` if running on limited systems

## Volumes

The setup creates and manages these volumes:

- `postgres_data`: PostgreSQL database files
- Bind mounts:
  - `./backend/uploads`: Uploaded video files
  - `./backend/extracted_frames`: Extracted frames from videos
  - `./backend/pose_results`: Pose estimation results

These directories persist data between container restarts.

## Networking

All services communicate via the `sports-injury-network` Docker network:

- Frontend (nginx) can reach backend at `http://backend:8000`
- Backend can reach database at `db:5432`
- Host machine can reach all services at `localhost:<port>`

## Development vs Production

The current setup is optimized for local development. For production:

1. Remove `ports` mappings and use an external reverse proxy
2. Remove `volumes` for sensitive data
3. Use production database configurations
4. Enable resource limits and logging

## Additional Commands

```bash
# See all running containers
docker ps

# See all containers (including stopped)
docker ps -a

# View image information
docker images

# Remove unused images/containers/volumes
docker system prune
docker system prune -a  # Remove all, including unused images

# Execute command in running container
docker compose exec backend bash

# View container resource usage
docker stats
```

## Support

For issues or questions about the Docker setup, check:

1. Docker logs: `docker compose logs`
2. Container health: `docker compose ps`
3. Network connectivity: `docker compose exec backend curl http://db:5432`
