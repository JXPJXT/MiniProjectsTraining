# HRMS Deployment and Setup Guide

## 1. Database Setup (Supabase)

You must create the authentication tables before anything else works.

1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Create a new query.
3. Copy the contents of `auth_table.sql` from the root of this project.
4. Run the query. This will create the `users` and `user_sessions` tables.

---

## 2. Google OAuth Configuration (Google Cloud Platform)

This is required to make the "Sign in with Google" button work.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "HRMS-Production").
3. Search for **"Google Identity Services"** (or just go to **APIs & Services** -> **Credentials**).
4. Click **Create Credentials** -> **OAuth client ID**.
5. Select **Web application** as the application type.
6. Name it (e.g., "HRMS Web Client").
7. **Authorized JavaScript Origins**:
   - Add `http://localhost:5173` (for local development).
   - Add `https://your-project-name.vercel.app` (once you deploy to Vercel).
8. **Authorized Redirect URIs**:
   - Add `http://localhost:5173`
   - Add `https://your-project-name.vercel.app`
9. Click **Create**.
10. Copy the **Client ID** (it looks like `123456789-abcdefg.apps.googleusercontent.com`).

### Where to paste the Client ID:
- **Local Dev**: Open `frontend/.env` and paste it as `VITE_GOOGLE_CLIENT_ID`.
- **Production (Vercel)**: Add it as an Environment Variable in the Vercel dashboard.

---

## 3. Backend Deployment (Render)

We will deploy the FastAPI backend to Render.

1. Push your code to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/).
3. Click **New** -> **Web Service**.
4. Connect your GitHub repository.
5. **Name**: `hrms-api` (or similar).
6. **Root Directory**: `.` (root).
7. **Runtime**: `Python 3`.
8. **Build Command**: `pip install -r requirements.txt`.
9. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
10. **Environment Variables**:
    - `SUPABASE_URL`: (Your Supabase URL)
    - `SUPABASE_KEY`: (Your Supabase Key)
    - `PYTHON_VERSION`: `3.12.0`
11. Click **Create Web Service**.
12. Once deployed, copy the unexpected URL (e.g., `https://hrms-api.onrender.com`).

---

## 4. Frontend Deployment (Vercel)

We will deploy the React frontend to Vercel.

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Set the **Root Directory** to `frontend`.
5. **Framework Preset**: Vite (should be auto-detected).
6. **Environment Variables**:
    - `VITE_API_URL`: Paste your Render backend URL (e.g., `https://hrms-api.onrender.com`).
    - `VITE_GOOGLE_CLIENT_ID`: Paste your Google Client ID from Step 2.
7. Click **Deploy**.

---

## 5. Final Checks

1. Verify that `VITE_API_URL` on Vercel does **NOT** have a trailing slash (e.g., `...onrender.com`, not `...onrender.com/`).
2. Verify that your Vercel URL is added to the **Authorized JavaScript Origins** in Google Cloud Console.
