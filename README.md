# FastFeast

FastFeast is a three-part food preorder system:

- `user/`: customer-facing React app
- `admin/`: admin and staff React app
- `backend/`: Express + MySQL API

## What It Solves

Customers can preorder food, avoid queue delays, and track pickup status.
Admin and staff users can manage menu items, inventory, feedback, and the live order workflow.

## Local Setup

1. Create the MySQL database using [fastfeast.sql](/Users/nitinreddy/Desktop/fastfeast/fastfeast.sql).
2. Copy the env templates:
   - `backend/.env.example` -> `backend/.env`
   - `user/.env.example` -> `user/.env`
   - `admin/.env.example` -> `admin/.env`
3. Install dependencies in each app:
   - `cd backend && npm install`
   - `cd user && npm install`
   - `cd admin && npm install`
4. Start the apps:
   - `cd backend && npm run dev`
   - `cd user && npm run dev`
   - `cd admin && npm run dev`

## Environment Variables

Backend:

- `PORT`
- `DB_HOST`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`
- `JWT_SECRET`
- `CORS_ORIGIN_CUSTOMER`
- `CORS_ORIGIN_ADMIN`
- `NODE_ENV`

Frontend apps:

- `VITE_API_BASE_URL`

## Deployment Notes

- Deploy the backend as a Node.js service with access to the MySQL instance.
- Deploy `user/` and `admin/` as static Vite builds.
- Set `VITE_API_BASE_URL` to the public backend URL for both frontends.
- Set backend CORS origins to the exact deployed frontend URLs.
- Use HTTPS in production so secure cookie settings can be enabled safely.

## Recommended Production Shape

- Backend: Render, Railway, Fly.io, EC2, or any Node host
- Database: Managed MySQL
- Frontends: Vercel, Netlify, or any static host

## Current Verification Note

The codebase has been updated for env-driven deployment, but local `vite build` verification is blocked in this environment because the installed Node version is `20.16.0` while Vite here requires `20.19+` or `22.12+`.
