# FastFeast

FastFeast is a food pre-order platform with three apps in one workspace:

- `user/`: customer-facing React app
- `admin/`: admin and staff React app
- `backend/`: Express API with MySQL

Customers can place orders before reaching the counter. Admin and staff users can manage menu items, availability, feedback, and order flow from a separate dashboard.
Payments are handled through Razorpay with backend signature verification.
Paid cancellations now move through a dedicated `Payments` ledger and can trigger Razorpay refunds.
Admin users can control ordering/payment availability and operating hours from the settings page.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Express, MySQL, JWT, cookie-based auth
- Workspace: npm workspaces

## Repository Structure

```text
FastFeast/
├── admin/     # admin and staff frontend
├── backend/   # API server and database access
├── docs/      # SQL dump and project report
├── user/      # customer frontend
└── package.json
```

## Prerequisites

- Node.js 18+ recommended
- npm
- MySQL

## Setup

### 1. Install dependencies

From the repository root:

```bash
npm install
```

### 2. Create and seed the database

Use these SQL files in order:

```text
docs/fastfeast.sql
docs/fastfeast_dump.sql
```

`docs/fastfeast.sql` sets up the database schema, procedures, triggers, and views.

`docs/fastfeast_dump.sql` loads the sample application data snapshot, including users, menu items, orders, inventory, feedback, business settings, and payment ledger entries.

Import them in this order:

```bash
mysql -u your_mysql_user -p < docs/fastfeast.sql
mysql -u your_mysql_user -p fastfeast < docs/fastfeast_dump.sql
```

### 3. Configure environment files

Create these files from the existing examples:

```text
backend/.env
user/.env
admin/.env
```

Current example values:

`backend/.env.example`

```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASS=your_password
DB_NAME=fastfeast
PORT=3000
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ORIGIN_CUSTOMER=http://localhost:5173
CORS_ORIGIN_ADMIN=http://localhost:5174
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxx
PAYMENT_TIMEOUT_MINUTES=15
CANTEEN_OPEN=true
CANTEEN_OPEN_HOUR_START=8
CANTEEN_OPEN_HOUR_END=22
```

`user/.env.example`

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

`admin/.env.example`

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Running Locally

Start each app from the repository root in separate terminals:

```bash
npm run dev:backend
```

```bash
npm run dev:user
```

```bash
npm run dev:admin
```

### Local URLs

- Backend API: `http://localhost:3000`
- User app: `http://localhost:5173`
- Admin app: `http://localhost:5174`

## Available Scripts

From the repository root:

```bash
npm run dev:backend
npm run dev:user
npm run dev:admin
npm run build:user
npm run build:admin
npm run lint:user
npm run lint:admin
```

## Default Admin Login

If you import only [docs/fastfeast.sql](/home/harshith/Programms/FastFeast/docs/fastfeast.sql), the seeded admin account is:

- Email: `admin@fastfeast.local`
- Password: `Admin@123`

If you also import [docs/fastfeast_dump.sql](/home/harshith/Programms/FastFeast/docs/fastfeast_dump.sql), the seed snapshot replaces the base records with sample users, menu data, orders, payments, inventory, feedback, and business settings.

Sample admin accounts from the dump include:

- Email: `admin@fastfeast.com`
- Email: `admin123@fastfeast.com`
- Email: `admin12345@gmail.com`

## Environment Variables

### Backend

- `DB_HOST`: MySQL host
- `DB_USER`: MySQL username
- `DB_PASS`: MySQL password
- `DB_NAME`: database name
- `PORT`: API server port
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: token lifetime value
- `NODE_ENV`: runtime mode
- `CORS_ORIGIN_CUSTOMER`: allowed origin for the customer app
- `CORS_ORIGIN_ADMIN`: allowed origin for the admin app
- `RAZORPAY_KEY_ID`: Razorpay public key used by the backend SDK
- `RAZORPAY_KEY_SECRET`: Razorpay secret key used only on the backend
- `PAYMENT_TIMEOUT_MINUTES`: how long an unpaid order stays active
- `CANTEEN_OPEN`: global on/off switch for ordering
- `CANTEEN_OPEN_HOUR_START`: opening hour in 24h format
- `CANTEEN_OPEN_HOUR_END`: closing hour in 24h format
- `RAZORPAY_WEBHOOK_SECRET`: secret used to verify Razorpay webhook events

### Frontends

- `VITE_API_BASE_URL`: backend base URL used by both `user` and `admin`
- `VITE_RAZORPAY_KEY_ID`: Razorpay key used to open checkout in the user app

## Build

To create production builds for the frontend apps:

```bash
npm run build:user
npm run build:admin
```

## Deployment Notes

- Deploy `backend/` as a Node.js service with MySQL access.
- Deploy `user/` and `admin/` as static Vite apps.
- Set `VITE_API_BASE_URL` in both frontends to the public backend URL.
- Set backend CORS origins to the exact deployed frontend URLs.
- Use a strong `JWT_SECRET` in production.
- Use HTTPS in production if you want secure cookies enabled safely.

## Notes

- Environment files are per app. There is no root `.env`.
- The backend uses npm workspace scripts from the repository root.
- SQL and project documentation live in `docs/`.
- The consolidated schema in [docs/fastfeast.sql](/home/harshith/Programms/FastFeast/docs/fastfeast.sql) includes the payments ledger and refund support.
