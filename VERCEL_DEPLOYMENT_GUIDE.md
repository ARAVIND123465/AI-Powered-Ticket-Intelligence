# Vercel Deployment & Full-Stack Integration Guide

This guide explains how to deploy the **AI Ticket Intelligence Platform** to Vercel and connect the React + Vite frontend with the FastAPI backend.

---

## Architecture Overview

1. **Frontend**: React 19 + Vite + TypeScript Single Page Application (SPA).
2. **Backend**: FastAPI with Machine Learning (scikit-learn, TF-IDF), RAG, and JWT authentication.
3. **Connection**: Configurable via `VITE_API_URL` environment variable (defaults to `/api` proxy in development and Vercel rewrites in production).

---

## Deployment Options

### Option 1: Full-Stack Monorepo on Vercel (Recommended Quick Deploy)

The repository is pre-configured with:
- `vercel.json` at root managing both the static frontend build and serverless Python API.
- `api/index.py` ASGI handler for FastAPI serverless execution.
- `requirements.txt` at root for Python dependencies.

#### Steps:
1. Push your repository to **GitHub / GitLab / Bitbucket**.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New" → "Project"**.
3. Import this repository.
4. Leave **Root Directory** as `./` (default).
5. In **Environment Variables**, add:
   - `SECRET_KEY`: Any secure random string (e.g. `your-production-secret-key-32chars`)
   - `GEMINI_API_KEY`: Your Google Gemini API key (optional for AI features)
6. Click **Deploy**.

---

### Option 2: Frontend on Vercel + Backend on Render / Railway / Fly.io (Recommended for Heavy ML/AI)

For production deployments with high AI/ML traffic, hosting the FastAPI backend on a continuous container (Render, Railway, or Fly.io) gives persistent memory for ML models.

#### Step 1: Deploy Backend (Render / Railway / Fly.io)
1. Deploy `enterprise-ai-helpdesk/backend` with command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
2. Set backend environment variables:
   - `CORS_ORIGINS`: `https://your-vercel-app.vercel.app`
   - `SECRET_KEY`: `your-production-secret-key`
   - `GEMINI_API_KEY`: `your-gemini-key`

#### Step 2: Deploy Frontend on Vercel
1. Import repository to Vercel.
2. In Vercel Project Settings → **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api` (or your Railway/Fly URL)
3. Click **Deploy**.

---

## Environment Variables Reference

### Frontend (.env or Vercel Environment Variables)
| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_URL` | Full URL to the backend `/api` endpoint (e.g. `https://api.yourdomain.com/api`) | `/api` (local proxy) |

### Backend (.env or Server Environment Variables)
| Variable | Description | Default |
| --- | --- | --- |
| `DATABASE_URL` | SQLAlchemy connection string (SQLite, PostgreSQL, MySQL) | `sqlite:///./enterprise_helpdesk.db` |
| `SECRET_KEY` | JWT encryption secret key | Auto-generated development key |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins (e.g. `https://my-app.vercel.app,https://my-domain.com`) | Automatically allows all `*.vercel.app` domains |
| `GEMINI_API_KEY` | Google Gemini API key for ticket AI insights and chatbot | None |

---

## Verification & Health Check

After deployment, test the connection:
1. **Frontend Home**: `https://your-app.vercel.app`
2. **Login Portal**: `https://your-app.vercel.app/login`
3. **Backend Health Check**: `https://your-app.vercel.app/api/users/me` (returns HTTP 401 when unauthenticated)
