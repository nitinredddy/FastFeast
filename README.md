# FastFeast

FastFeast is a three-part food preorder system:

- `user/`: customer-facing React app
- `admin/`: admin and staff React app
- `backend/`: Express + MySQL API
- `docs/`: database dump and project report

## What It Solves

Customers can preorder food, avoid queue delays, and track pickup status.
Admin and staff users can manage menu items, inventory, feedback, and the live order workflow.

## Project Structure

- `backend/`: Express API and MySQL integration
- `user/`: customer-facing Vite + React app
- `admin/`: admin and staff Vite + React app
- `docs/`: database SQL and project report

## Local Setup

1. Create the MySQL database using `docs/fastfeast.sql`.
2. Copy the env templates:
   - `backend/.env.example` -> `backend/.env`
   - `user/.env.example` -> `user/.env`
   - `admin/.env.example` -> `admin/.env`
3. Install dependencies from the repo root:
   - `npm install`
4. Start the apps from the repo root:
   - `npm run dev:backend`
   - `npm run dev:user`
   - `npm run dev:admin`

## Default Admin

After importing `docs/fastfeast.sql`, the database includes a default admin account for the admin app:

- Email: `admin@fastfeast.local`
- Password: `Admin@123`

## Local Ports

- Backend API: `http://localhost:3000`
- User app: `http://localhost:5173`
- Admin app: `http://localhost:5174`

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

Example local values:

- `backend/.env.example`
  - `PORT=3000`
  - `CORS_ORIGIN_CUSTOMER=http://localhost:5173`
  - `CORS_ORIGIN_ADMIN=http://localhost:5174`
- `user/.env.example`
  - `VITE_API_BASE_URL=http://localhost:3000`
- `admin/.env.example`
  - `VITE_API_BASE_URL=http://localhost:3000`

## Workspace Scripts

From the repo root:

- `npm run dev:backend`
- `npm run dev:user`
- `npm run dev:admin`
- `npm run build:user`
- `npm run build:admin`
- `npm run lint:user`
- `npm run lint:admin`

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

## Verification

- `user`: `npm run lint` passed
- `admin`: `npm run lint` passed
- `user`: `npm run build` passed
- `admin`: `npm run build` passed
- `backend`: local startup confirmed on port `3000`
