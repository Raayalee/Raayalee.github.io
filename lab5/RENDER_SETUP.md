# Render Postgres Setup (lab5)

This guide shows how to apply the Postgres schema, seed data, and configure Render.

## 1) Create Render Postgres
- Create a Postgres database in Render.
- Copy the connection string (DATABASE_URL).

## 2) Apply schema
Use the schema file to create tables and indexes.

PowerShell:
```
$env:DATABASE_URL = "YOUR_RENDER_DATABASE_URL"
psql $env:DATABASE_URL -f "lab5/server/sql/schema.sql"
```

## 3) Seed public data
This seeds hackathons and participants from public/data/appData.json.

PowerShell:
```
$env:DATABASE_URL = "YOUR_RENDER_DATABASE_URL"
$env:PGSSL = "1"
npm run seed:postgres
```

## 4) Render Web Service (backend)
Root: lab5/server
- Build command: npm install
- Start command: npm start
- Env vars:
  - DATABASE_URL
  - JWT_SECRET
  - CORS_ORIGIN
  - PGSSL=1
  - NODE_ENV=production

## 5) Render Static Site (frontend)
Root: lab5
- Build command: npm install && npm run build
- Publish directory: lab5/build
- Env vars:
  - REACT_APP_API_BASE_URL=https://<your-render-backend>

## 6) Quick checks
- GET /api/public-data
- POST /api/auth/register
- POST /api/auth/login
- GET /api/applications
