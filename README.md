# Sports Injury Risk Detection from Video

## 🎯 Project Status: ✅ COMPLETE - MILESTONE 4 DELIVERED

An AI-powered web platform for early detection and analysis of sports injury risk factors through intelligent video analysis, pose estimation, and biomechanical assessment.

**Current Version**: 1.0 (Production Ready)  
**Completion Date**: August 2026  
**Overall Status**: All 4 Milestones Delivered

### 📚 Quick Navigation

**For Documentation**: See **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** - Comprehensive 35-section technical reference  
**For Presentation**: See **[PRESENTATION_OUTLINE.md](PRESENTATION_OUTLINE.md)** - 21-slide presentation structure  
**For Quick Reference**: See **[TECHNICAL_QUICK_REFERENCE.md](TECHNICAL_QUICK_REFERENCE.md)** - Cheat sheet for developers  
**For Cloud Deployment**: See **[CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md)** - Multi-platform deployment  
**For Local Development**: See **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Docker Compose setup  

---

## 🎓 Project Milestones

### ✅ Milestone 1: Project Foundation
- React frontend scaffolded with Vite
- FastAPI backend starter application
- React Router-based navigation
- Login page connected to backend credential validation
- Athlete Profile page with validation
- Clean modular folder structure

### ✅ Milestone 2: Core Functionality
- Complete user authentication system with roles
- Multi-role access control (5 roles)
- Athlete profile management
- Video upload and processing
- Pose estimation integration (YOLOv8n)
- Initial injury risk analysis

### ✅ Milestone 3: Advanced Features
- Enhanced prediction algorithms
- Anomaly detection system (6 movement issues)
- Analysis history tracking
- Role-based dashboards
- Comprehensive testing suite (100% pass rate)
- Docker containerization

### ✅ Milestone 4: Enterprise Features
- Executive dashboard with analytics
- High-risk alert system
- Team performance tracking
- Risk distribution visualization
- Cloud deployment readiness
- **Final documentation and presentation** ✓

---

## ✨ Key Features

### 🎬 Video Analysis Pipeline
- Upload athletic videos (MP4, MOV, AVI)
- Automatic frame extraction and processing
- YOLOv8n AI-powered pose estimation
- Detection of 17 human body keypoints
- Real-time biomechanical metric calculation

### 🧠 Intelligent Risk Analysis
**6 Biomechanical Metrics**:
1. Torso Lean (core weakness detection)
2. Balance Score (stability assessment)
3. Shoulder Alignment (symmetry check)
4. Knee Asymmetry (ACL risk indicator)
5. Hip Asymmetry (IT band syndrome risk)
6. Posture Stability (postural control)

**6 Movement Issues Detected**:
- Excessive Torso Lean
- Poor Balance
- Shoulder Imbalance
- Knee Valgus (inward collapse)
- Hip Drop (glute weakness)
- Poor Posture Stability

**Risk Scoring**: 0-100 scale with Low/Medium/High classification

### 👥 Multi-User Platform
- **5 User Roles**: Athlete, Coach, Physiotherapist, Sports Scientist, Admin
- **Role-Based Dashboards**: Different views for different user types
- **Team Management**: Coaches can monitor team performance
- **Data Isolation**: Athletes see only their own analyses

### 📊 Executive Dashboard
- Summary cards with key metrics
- Risk distribution visualization
- High-risk athlete alerts
- Team rankings and analytics
- Recent activity feed
- Customizable per user role

### 📈 Analysis History & Tracking
- Complete analysis records stored
- Longitudinal tracking over time
- Detailed metrics reports
- Actionable recommendations
- Professional notes and follow-ups

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Python 3.11
- Docker Desktop (for local development)
- Port availability: 3000 (frontend), 8000 (backend), 5432 (database)

### Setup & Run

```powershell
# 1. Clone and navigate to project
cd d:\Infosys_Internship\Ai-Sports injury risk detection

# 2. Create Python 3.11 virtual environment
py -3.11 -m venv .venv
. .venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -U pip
pip install -r backend/requirements.txt

# 4. Start with Docker Compose
docker compose build
docker compose up

# 5. Access the application
# Frontend:     http://localhost:3000
# Backend API:  http://localhost:8000
# API Docs:     http://localhost:8000/docs
# Database:     localhost:5432
```

### Try a Quick Test
```powershell
# Run test suite
python -m pytest backend/tests/ -v

# Expected: 100+ tests passing ✅
```

---

## 📦 Technology Stack

**Frontend**: React 18, Vite, React Router  
**Backend**: FastAPI, Python 3.11, SQLAlchemy  
**Database**: PostgreSQL 15  
**AI/ML**: YOLOv8n (pose estimation), OpenCV, NumPy  
**Deployment**: Docker, Cloud Run, Azure ACI, VPS  
**Testing**: Pytest (100+ tests, 100% pass rate)

---

## 🧪 Testing

The platform includes a comprehensive test suite:

```bash
# Run all tests
python -m pytest backend/tests/ -v

# Run specific test module
python -m pytest backend/tests/test_injury_prediction.py -v

# Run with coverage
python -m pytest backend/tests/ --cov=app --cov-report=html
```

**Test Coverage**:
- ✅ Authentication & Authorization (13 tests)
- ✅ Database Operations (12 tests)
- ✅ Video Processing (14 tests)
- ✅ Pose Estimation (15 tests)
- ✅ Injury Prediction (18 tests)
- ✅ Anomaly Detection (14 tests)
- ✅ Analysis History (12 tests)
- ✅ Dashboard (8 tests)
- ✅ End-to-End Workflows (6 tests)

**Result**: All 100+ tests passing ✅

---

## ☁️ Cloud Deployment

### Option 1: Google Cloud Run (Recommended - 30 minutes)
```bash
python3 deploy.py gcloud
```
See [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md) for detailed steps.

### Option 2: Azure Container Instances
Follow instructions in [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md)

### Option 3: VPS (DigitalOcean, Linode, AWS EC2)
See [QUICK_START_DEPLOYMENT.md](QUICK_START_DEPLOYMENT.md)

---

## 📊 Platform Statistics

- **API Endpoints**: 20+
- **Database Tables**: 4 core tables
- **User Roles**: 5 distinct roles
- **Biomechanical Metrics**: 6 analyzed
- **Movement Issues Detected**: 6 types
- **Test Cases**: 100+
- **Test Pass Rate**: 100%
- **Lines of Code**: ~5,000 (backend + frontend)
- **Cloud Support**: 3 platforms

---

## 📖 Documentation

All documentation is in the project root directory:

| Document | Purpose |
|----------|---------|
| **PROJECT_DOCUMENTATION.md** | 35-section comprehensive technical reference (START HERE) |
| **PRESENTATION_OUTLINE.md** | 21-slide presentation with talking points |
| **MILESTONE4_COMPLETION_SUMMARY.md** | Executive summary of completed work |
| **TECHNICAL_QUICK_REFERENCE.md** | Quick lookup guide and cheat sheet |
| **CLOUD_DEPLOYMENT_GUIDE.md** | Multi-platform cloud deployment instructions |
| **DOCKER_SETUP.md** | Local Docker development guide |
| **QUICK_START_DEPLOYMENT.md** | Quick reference commands |

---

## 🔒 Security Features

- Role-based access control (RBAC)
- Encrypted password storage
- User data isolation
- CORS security configuration
- SQL injection prevention (SQLAlchemy ORM)
- Audit logging capability
- GDPR/HIPAA compliance ready

---

## 📋 Project Structure

```text
frontend/
backend/
datasets/
docs/
docker/

## 🐍 Python Setup (3.11 Required)

This project requires **Python 3.11**. Using Python 3.13 or other versions may cause compatibility issues.

### Installation Steps

1. **Install Python 3.11**  
   Download from: https://www.python.org/downloads/release/python-311/

2. **Create Virtual Environment**
   ```powershell
   py -3.11 -m venv .venv
   . .venv\Scripts\Activate.ps1
   ```

3. **Install Dependencies**
   ```powershell
   pip install -U pip
   pip install -r backend/requirements.txt
   ```

4. **Verify Installation** (Optional)
   ```powershell
   python --version  # Should show 3.11.x
   pip list          # Should show all required packages
   ```

---

## 🎯 Next Steps

### For Development
1. Read [TECHNICAL_QUICK_REFERENCE.md](TECHNICAL_QUICK_REFERENCE.md) - Quick lookup guide
2. Read [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) - Full technical reference
3. Review test suite: `python -m pytest backend/tests/ -v`
4. Explore API documentation: Run `docker compose up` then visit http://localhost:8000/docs

### For Deployment
1. Choose platform: Google Cloud Run (recommended), Azure ACI, or VPS
2. Read [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md)
3. Follow deployment steps for your chosen platform
4. Test application in cloud

### For Presentation
1. Review [PRESENTATION_OUTLINE.md](PRESENTATION_OUTLINE.md) - 21-slide structure
2. Prepare demo: Run `docker compose up` locally
3. Test all workflows: Registration → Video Upload → Analysis → Dashboard
4. Review talking points and key statistics

### For Project Review
1. Read [MILESTONE4_COMPLETION_SUMMARY.md](MILESTONE4_COMPLETION_SUMMARY.md) - Executive summary
2. Check [TECHNICAL_QUICK_REFERENCE.md](TECHNICAL_QUICK_REFERENCE.md) - Key metrics and statistics
3. Review test results: All 100+ tests passing ✅
4. See deployment options: 3 cloud platforms supported

---

## ✅ Verification Checklist

Use this checklist to verify everything is working:

- [ ] Python 3.11 installed: `python --version`
- [ ] Virtual environment created and activated
- [ ] Dependencies installed: `pip list`
- [ ] Docker installed and running
- [ ] Tests passing: `python -m pytest backend/tests/ -v`
- [ ] Application runs: `docker compose up`
- [ ] Frontend accessible: http://localhost:3000
- [ ] Backend accessible: http://localhost:8000
- [ ] API docs visible: http://localhost:8000/docs

---

## 🤝 Contributing & Future Work

### Planned Enhancements (Phase 2-4)
- Real-time webcam-based analysis
- Sport-specific injury prediction models
- Mobile app (iOS/Android)
- Wearable device integration
- Advanced 3D visualization
- Multi-facility management
- Research database and export

See [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) Future Enhancements section for details.

---

## 📞 Support & Resources

### Documentation Resources
- **Technical Details**: [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
- **Quick Reference**: [TECHNICAL_QUICK_REFERENCE.md](TECHNICAL_QUICK_REFERENCE.md)
- **Deployment**: [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md)
- **Local Setup**: [DOCKER_SETUP.md](DOCKER_SETUP.md)
- **API Reference**: Visit http://localhost:8000/docs (when running)

### Code Reference
- **Backend Routes**: `backend/app/routes/`
- **Backend Models**: `backend/app/models/`
- **Backend Services**: `backend/app/services/`
- **Frontend Pages**: `frontend/src/pages/`
- **Frontend Components**: `frontend/src/components/`
- **Tests**: `backend/tests/`

---

## 📄 License & Project Info

**Project**: Sports Injury Risk Detection Platform  
**Version**: 1.0.0  
**Status**: Complete - Production Ready  
**Last Updated**: August 2026  
**Total Development**: 4 Milestones  

---

## 🎓 Academic Use

This project was developed as part of an internship program and demonstrates:
- Full-stack web development (React + FastAPI)
- AI/ML integration (computer vision)
- Database design and management
- Cloud deployment and DevOps
- Testing and quality assurance
- Documentation and presentation skills

Suitable for portfolio, interviews, and professional use.

---

**Project Status: ✅ COMPLETE - READY FOR PRODUCTION DEPLOYMENT**

**Start with**: [TECHNICAL_QUICK_REFERENCE.md](TECHNICAL_QUICK_REFERENCE.md) for a quick overview or [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) for comprehensive details.