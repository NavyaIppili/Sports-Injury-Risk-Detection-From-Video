# Sports Injury Risk Detection from Video

An internship project scaffold for building a sports injury risk detection platform incrementally.

## Milestone 1

This milestone includes:

- React frontend scaffolded with Vite
- FastAPI backend starter application
- React Router-based navigation
- Login page connected to backend credential validation
- Athlete Profile page with local state and validation placeholders
- Clean modular folder structure for future expansion

## Project Structure

```text
frontend/
backend/
datasets/
docs/
docker/
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- npm

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will run on the Vite development server.

## Backend Setup

Create and activate a Python virtual environment, then install dependencies:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The FastAPI app will run at `http://127.0.0.1:8000`.

### Default Login Credentials

Use these credentials in the frontend login form while running locally:

- Email: `athlete@example.com`
- Password: `Athlete@123`

You can override them with environment variables before starting the backend:

- `LOGIN_EMAIL`
- `LOGIN_PASSWORD`

## Notes

- The frontend now validates login against the backend `/api/v1/auth/login` endpoint.
- PostgreSQL, file uploads, video processing, pose estimation, and injury prediction are intentionally left for later milestones.
- The backend is a starter structure that can be extended with routers, services, models, and database integration.
