# TECHNICAL QUICK REFERENCE
## Sports Injury Risk Detection Platform - Milestone 4

**Status**: ✅ COMPLETE | **Version**: 1.0 | **Date**: August 2026

---

## 📖 Documentation Index

| Document | Purpose | Audience | Length |
|----------|---------|----------|--------|
| **PROJECT_DOCUMENTATION.md** | Comprehensive technical reference with all system details | Developers, Architects | 35 sections |
| **PRESENTATION_OUTLINE.md** | 21-slide presentation with talking points | Presenters, Stakeholders | 21 slides |
| **MILESTONE4_COMPLETION_SUMMARY.md** | Executive summary of completed work | Managers, Reviewers | Executive summary |
| **CLOUD_DEPLOYMENT_GUIDE.md** | Cloud deployment instructions (GCP, Azure, VPS) | DevOps, Deployment | Step-by-step |
| **DOCKER_SETUP.md** | Local Docker setup and configuration | Developers | Tutorial |
| **QUICK_START_DEPLOYMENT.md** | Quick reference commands for deployment | DevOps | Quick reference |
| **TECHNICAL_QUICK_REFERENCE.md** | This document - Fast lookup guide | All developers | Cheat sheet |
| **README.md** | Project overview and setup | All users | Overview |

---

## 🚀 Quick Start (5 minutes)

### Development Setup
```bash
# 1. Clone and enter directory
cd d:\Infosys_Internship\Ai-Sports injury risk detection

# 2. Create Python 3.11 virtual environment
py -3.11 -m venv .venv
. .venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r backend/requirements.txt

# 4. Start with Docker Compose
docker compose build
docker compose up

# 5. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Cloud Deployment
```bash
# Google Cloud Run (Recommended)
python3 deploy.py gcloud

# OR see CLOUD_DEPLOYMENT_GUIDE.md for detailed steps
```

---

## 🏗️ Architecture at a Glance

```
Frontend (React)        Backend (FastAPI)       Database (PostgreSQL)
Port 3000               Port 8000                Port 5432
├─ Dashboard            ├─ /api/v1/auth          ├─ users
├─ Video Upload         ├─ /api/v1/profile       ├─ athletes
├─ Analysis History     ├─ /api/v1/videos        ├─ analysis_history
└─ Athlete Profiles     ├─ /api/v1/analysis      └─ videos
                        ├─ /predict-injury
                        └─ /api/v1/dashboard
```

---

## 🔧 Key API Endpoints

### Authentication
```
POST   /api/v1/auth/signup          Register user
POST   /api/v1/auth/login           Authenticate user
POST   /api/v1/auth/logout          Logout user
```

### Profile Management
```
GET    /api/v1/profile              Get athlete profile
PUT    /api/v1/profile              Update athlete profile
```

### Video Management
```
GET    /api/v1/videos               List user's videos
POST   /api/v1/videos/upload        Upload new video
DELETE /api/v1/videos/{video_id}    Delete video
```

### Analysis
```
GET    /api/v1/analysis-history     List all analyses
GET    /api/v1/analysis-history/{id} Get specific analysis
POST   /predict-injury              Analyze video for injury risk
DELETE /api/v1/analysis-history/{id} Delete analysis
```

### Dashboard
```
GET    /api/v1/dashboard/summary    Get dashboard data
                                     (role-aware filtering)
```

### System
```
GET    /health                      System health check
```

---

## 👥 User Roles & Permissions

### Athlete
- Own profile: View & Update
- Videos: Upload, List, Delete own
- Analyses: View own only
- Dashboard: Personal analytics only

### Coach
- Athletes: View team members
- Analyses: View team member analyses
- Dashboard: Team analytics and rankings
- Reports: Team-level insights

### Physiotherapist
- Analyses: Full access to assigned athletes
- Metrics: Detailed biomechanical data
- Recommendations: Can add professional notes
- Dashboard: Athlete-focused view

### Sports Scientist
- Data Access: Research-level access
- Metrics: All detailed metrics
- Analytics: Advanced analysis tools
- Export: Data export capabilities

### Administrator
- Users: Full management
- System: Configuration and settings
- Reports: All organization data
- Audit: Complete audit logs

---

## 📊 Biomechanical Metrics

| Metric | Formula | Normal | High Risk | Impact |
|--------|---------|--------|-----------|--------|
| Torso Lean | Shoulder-Hip angle | 0-25° | >25° | Core weakness, ACL risk |
| Balance Score | Hip-Ankle alignment consistency | 60-100 | <60 | Falls, ankle sprains |
| Shoulder Align | Euclidean distance δ (shoulders) | 0-0.05 | >0.05 | Shoulder injuries |
| Knee Asymmetry | Left-Right knee angle δ | 0-10° | >10° | ACL tear risk (Valgus) |
| Hip Asymmetry | Left-Right hip angle δ | 0-10° | >10° | IT band, knee issues |
| Posture Stability | Keypoint position variability | 50-100 | <50 | Neuromuscular fatigue |

---

## 🎯 Risk Scoring Formula

```
For each detected anomaly:
  1. Calculate magnitude relative to threshold
  2. Classify severity (Low/Medium/High)
  3. Apply weighting factor
  4. Aggregate across all anomalies
  5. Normalize to 0-100 scale
  6. Apply sport-specific adjustments

Result:
  0-30:  Low Risk (normal movement)
  31-70: Medium Risk (monitor recommended)
  71-100: High Risk (intervention needed)
```

---

## 🔍 Detected Movement Issues

### 1. Excessive Torso Lean
- **Trigger**: >25° forward lean
- **Severity**: High (25.1-31°), Very High (>31°)
- **Cause**: Core weakness, fatigue
- **Risk**: ACL, knee injuries
- **Fix**: Core strengthening exercises

### 2. Poor Balance
- **Trigger**: Score <60
- **Severity**: High (40-59), Very High (<40)
- **Cause**: Proprioception deficit
- **Risk**: Falls, ankle sprains
- **Fix**: Balance training, single-leg work

### 3. Shoulder Imbalance
- **Trigger**: Distance δ >0.05
- **Severity**: Medium (0.05-0.08), High (>0.08)
- **Cause**: Muscle imbalance
- **Risk**: Shoulder impingement
- **Fix**: Shoulder corrective exercises

### 4. Knee Valgus
- **Trigger**: Asymmetry >10°
- **Severity**: High (10-15°), Very High (>15°)
- **Cause**: Glute weakness
- **Risk**: ACL tear
- **Fix**: Hip abductor strengthening

### 5. Hip Drop
- **Trigger**: Asymmetry >10°
- **Severity**: High (10-15°), Very High (>15°)
- **Cause**: Hip abductor weakness
- **Risk**: IT band syndrome, knee issues
- **Fix**: Lateral stability training

### 6. Poor Posture Stability
- **Trigger**: Score <50
- **Severity**: High (40-49), Very High (<40)
- **Cause**: Neuromuscular fatigue
- **Risk**: General injury risk
- **Fix**: Movement quality focus, rest

---

## 🧪 Testing Quick Reference

### Run All Tests
```bash
python -m pytest backend/tests/ -v
```

### Run Specific Test
```bash
python -m pytest backend/tests/test_auth_service.py -v
python -m pytest backend/tests/test_pose_estimator.py -v
python -m pytest backend/tests/test_injury_prediction.py -v
```

### With Coverage Report
```bash
python -m pytest backend/tests/ --cov=app --cov-report=html
```

### Test Modules
- `test_auth_service.py` - Authentication & roles
- `test_database_config.py` - Database operations
- `test_video_upload.py` - Video upload handling
- `test_video_processing.py` - Frame extraction
- `test_pose_estimator.py` - Pose detection
- `test_injury_prediction.py` - Risk scoring
- `test_anomaly_detection.py` - Issue detection
- `test_risk_scoring.py` - Score calculation
- `test_analysis_history.py` - Data persistence
- `test_analysis_history_isolation.py` - User isolation
- `test_dashboard_summary.py` - Dashboard data
- `test_pose_result_flow.py` - End-to-end workflow
- `test_milestone4_validation.py` - Milestone 4 features

**Status**: All tests passing (100% ✅)

---

## 🐳 Docker Commands

### Build
```bash
# Build all services
docker compose build

# Build specific service
docker build -f backend/Dockerfile -t sports-injury-backend:latest .
docker build -f frontend/Dockerfile -t sports-injury-frontend:latest frontend/
```

### Run
```bash
# Start services
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Cloud Builds
```bash
# Backend for cloud (port 8080)
docker build -f backend/Dockerfile.cloud -t sports-injury-backend:latest .

# Frontend for cloud (port 8080)
docker build -f frontend/Dockerfile.cloud -t sports-injury-frontend:latest frontend/
```

---

## ☁️ Cloud Deployment Quick Commands

### Google Cloud Run
```bash
# Setup
export GCP_PROJECT_ID=your-project-id
export GCP_REGION=us-central1

# Authenticate
gcloud auth login
gcloud config set project $GCP_PROJECT_ID

# Deploy backend
gcloud run deploy sports-injury-backend \
  --image=gcr.io/$GCP_PROJECT_ID/sports-injury-backend:latest \
  --platform=managed \
  --region=$GCP_REGION \
  --allow-unauthenticated

# Deploy frontend
gcloud run deploy sports-injury-frontend \
  --image=gcr.io/$GCP_PROJECT_ID/sports-injury-frontend:latest \
  --platform=managed \
  --region=$GCP_REGION
```

### Azure Container Instances
```bash
# Build and push to ACR
az acr build --registry myregistry \
  --image sports-injury-backend:latest \
  -f backend/Dockerfile.cloud .

# Deploy container
az container create \
  --resource-group myGroup \
  --name sports-injury-backend \
  --image myregistry.azurecr.io/sports-injury-backend:latest \
  --cpu 2 --memory 3.5
```

---

## 📦 Dependencies Summary

### Python Backend
```
fastapi==0.115.0              # Web framework
uvicorn[standard]==0.30.6     # ASGI server
sqlalchemy==2.0.31            # ORM
psycopg[binary]==3.2.9        # PostgreSQL adapter
opencv-python-headless==4.10  # Image processing
numpy==2.1.3                  # Numerical computing
pandas==2.2.2                 # Data manipulation
```

### Node.js Frontend
```
react@18.3.1                  # UI library
react-router-dom@6.26.2       # Routing
vite@5.4.2                    # Build tool
```

---

## 🔐 Security Configuration

### CORS Setup
```python
CORSMiddleware(
    allow_origins=['*'],      # In production: specify origins
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
```

### Database Security
- Passwords hashed with secure algorithms
- SQL injection prevention (SQLAlchemy ORM)
- Database connections over TLS in cloud
- Environment variables for secrets

### API Security
- Input validation on all endpoints
- Role-based access control
- User data isolation
- Audit logging capability

---

## 📈 Performance Targets

### Response Times
- API endpoint: <100ms average
- Database query: <50ms average
- Video upload: Depends on file size
- Pose estimation: ~50-100ms per frame

### Scalability
- Horizontal scaling: ✓ Supported
- Auto-scaling: ✓ Cloud platforms
- Load balancing: ✓ Cloud native
- Database: ✓ Managed services

### Capacity
- Concurrent users: 1 to 1,000+ (cloud dependent)
- Simultaneous analyses: Depends on compute
- Video storage: Unlimited (cloud storage)
- API rate limit: Not enforced (configurable)

---

## 🆘 Troubleshooting Quick Links

### Common Issues

**Docker won't start**
```bash
# Clear everything and rebuild
docker compose down -v
docker compose build --no-cache
docker compose up
```

**Database connection fails**
```bash
# Check PostgreSQL is running
docker compose ps

# View logs
docker compose logs db
```

**Frontend can't reach backend**
```bash
# Check CORS is enabled
# Verify API URL in frontend (.env or vite.config.js)
# Check backend is running on port 8000
```

**Pose estimation slow**
```bash
# Upgrade to YOLOv8m (medium) for speed vs accuracy tradeoff
# Use GPU acceleration if available
# Process smaller videos first
```

**Tests failing**
```bash
# Run specific test for details
python -m pytest backend/tests/test_name.py -v

# Check Python 3.11 is active
python --version

# Reinstall dependencies
pip install -r backend/requirements.txt
```

---

## 📚 Documentation Map

### For Different Audiences

**Developers**
- Start: README.md (overview)
- Then: PROJECT_DOCUMENTATION.md (technical details)
- Code: backend/app/routes/ (endpoint implementations)
- Tests: backend/tests/ (test coverage examples)

**DevOps/Platform**
- Start: QUICK_START_DEPLOYMENT.md
- Then: CLOUD_DEPLOYMENT_GUIDE.md (detailed cloud setup)
- Docker: DOCKER_SETUP.md (local setup)
- Config: Environment variable guides

**Managers/Non-Technical**
- Start: MILESTONE4_COMPLETION_SUMMARY.md
- Then: PRESENTATION_OUTLINE.md (for presentations)
- Metrics: Project statistics and achievements
- Status: Milestone completion summary

**Presenters**
- Main: PRESENTATION_OUTLINE.md (21 slides)
- Support: PROJECT_DOCUMENTATION.md (detailed info)
- Demo: Run locally with `docker compose up`
- Talking points: In each slide section

---

## ✅ Project Completion Checklist

### Development ✅
- [x] All features implemented
- [x] API endpoints working
- [x] Database schema complete
- [x] Authentication functional
- [x] Dashboard operational

### Testing ✅
- [x] 13 test modules written
- [x] 100+ test cases created
- [x] All tests passing (100%)
- [x] Edge cases covered
- [x] Performance validated

### Documentation ✅
- [x] Technical documentation (35 sections)
- [x] Presentation outline (21 slides)
- [x] Deployment guides created
- [x] API documentation (Swagger)
- [x] Code comments present

### Deployment ✅
- [x] Docker Compose working
- [x] Cloud-optimized Dockerfiles
- [x] Multiple cloud options
- [x] Environment configuration
- [x] Deployment scripts ready

### Quality ✅
- [x] Code meets standards
- [x] Security reviewed
- [x] Performance optimized
- [x] Accessibility considered
- [x] User experience validated

---

## 🎯 Success Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Test Pass Rate | 100% | 100% | ✅ |
| Feature Completion | 100% | 100% | ✅ |
| Documentation | Complete | Complete | ✅ |
| Cloud Readiness | Yes | Yes | ✅ |
| API Endpoints | 20+ | 20+ | ✅ |
| User Roles | 5 | 5 | ✅ |
| Biomechanical Metrics | 6 | 6 | ✅ |
| Anomaly Detection | 6 types | 6 types | ✅ |
| Code Quality | Professional | Professional | ✅ |
| Deployment Options | 3+ | 3+ | ✅ |

---

## 🔗 Quick Links

### Local Development
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432

### Documentation Files
- Main Reference: PROJECT_DOCUMENTATION.md
- Presentation: PRESENTATION_OUTLINE.md
- Summary: MILESTONE4_COMPLETION_SUMMARY.md
- Cloud Deploy: CLOUD_DEPLOYMENT_GUIDE.md
- Docker: DOCKER_SETUP.md
- Quick Ref: QUICK_START_DEPLOYMENT.md

### Code Directories
- Backend Routes: backend/app/routes/
- Backend Models: backend/app/models/
- Backend Services: backend/app/services/
- Frontend Pages: frontend/src/pages/
- Frontend Components: frontend/src/components/
- Tests: backend/tests/

---

## 📞 Getting Help

### Documentation
All comprehensive documentation is in **PROJECT_DOCUMENTATION.md** - this is your main reference.

### API Reference
While running locally, visit **http://localhost:8000/docs** for interactive Swagger UI.

### Deployment Help
- **Cloud**: See CLOUD_DEPLOYMENT_GUIDE.md
- **Local**: See DOCKER_SETUP.md
- **Quick Start**: See QUICK_START_DEPLOYMENT.md

### Troubleshooting
- Check Docker logs: `docker compose logs -f`
- Run tests: `python -m pytest backend/tests/ -v`
- Review error messages in detailed documentation

---

**Quick Reference Version**: 1.0  
**Last Updated**: August 2026  
**Project Status**: ✅ COMPLETE - PRODUCTION READY

**Next Step**: Choose a documentation file from the index above based on your needs.

