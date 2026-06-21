# EduSync Deploy Guide

## 1) Supabase database

1. Create a Supabase project.
2. Open the project dashboard.
3. Click `Connect`.
4. Copy the **Direct connection** Postgres string.
5. Set it as `DATABASE_URL` in Render.

Example:

```env
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
SUPABASE_DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

## 2) Cloudinary storage

1. Create a Cloudinary account.
2. Open the Cloudinary dashboard.
3. Copy the `CLOUDINARY_URL` connection string.
4. Set it as `CLOUDINARY_URL` in Render.

Example:

```env
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

## 3) Gemini AI

Set:

```env
GEMINI_API_KEY=your_gemini_key
```

## 4) Render backend

1. Create a new Web Service from GitHub.
2. Pick this repo.
3. Set the root directory to `edusync-backend`.
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add env vars:
   - `DATABASE_URL`
   - `SUPABASE_DATABASE_URL`
   - `SECRET_KEY`
   - `ALGORITHM=HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES=1440`
   - `CLOUDINARY_URL`
   - `GEMINI_API_KEY`

## 5) Vercel frontend

1. Create a new Vercel project from this repo.
2. Set the root directory to `edusync-frontend`.
3. Add env var:

```env
VITE_API_URL=https://your-render-service.onrender.com/api/v1
```

4. Add the backend URL to your frontend project settings.
5. Deploy.
