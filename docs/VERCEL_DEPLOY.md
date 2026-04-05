# Deploying FastFeast To Vercel

This project can be deployed, but there is one important rule:

- Vercel cannot access the MySQL database running on your own laptop.

If you want the deployed site to show the same menu items that exist locally, move your current MySQL data to a hosted MySQL database first, then point the Vercel backend at that database.

## Recommended Deployment Shape

Deploy these as three separate Vercel projects:

- `backend/` as the API project
- `user/` as the customer frontend
- `admin/` as the admin frontend

Set the Vercel project root directory to the matching folder for each deploy.

## 1. Move Local MySQL Data To A Hosted MySQL Database

Use any public MySQL provider that gives you standard MySQL connection details. Good options include Railway MySQL, Aiven MySQL, PlanetScale, Neon with MySQL-compatible options, or any VPS-hosted MySQL instance.

Export your current local database:

```bash
mysqldump -u your_mysql_user -p --databases fastfeast > fastfeast-production.sql
```

Import that dump into your hosted MySQL database:

```bash
mysql -h your_remote_host -u your_remote_user -p fastfeast < fastfeast-production.sql
```

That import carries over the menu items already saved on your system.

## 2. Deploy The Backend On Vercel

This repo already includes a Vercel serverless entrypoint at `backend/api/index.js`.

In Vercel:

1. Create a new project.
2. Import this repository.
3. Set the Root Directory to `backend`.
4. Add the environment variables below.
5. Deploy.

### Backend Environment Variables

Set these in the `backend` Vercel project:

```env
DB_HOST=your_remote_host
DB_USER=your_remote_user
DB_PASS=your_remote_password
DB_NAME=fastfeast
JWT_SECRET=use-a-strong-secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGIN_CUSTOMER=https://your-user-app.vercel.app
CORS_ORIGIN_ADMIN=https://your-admin-app.vercel.app
AUTH_COOKIE_MAX_AGE_MS=604800000
AUTH_COOKIE_SAME_SITE=none
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_DOMAIN=
AUTH_TRUST_PROXY=true
RAZORPAY_KEY_ID=your_live_or_test_key
RAZORPAY_KEY_SECRET=your_live_or_test_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
PAYMENT_TIMEOUT_MINUTES=15
CANTEEN_OPEN=true
CANTEEN_OPEN_HOUR_START=8
CANTEEN_OPEN_HOUR_END=22
```

After deployment, note your backend URL:

```text
https://your-backend-project.vercel.app
```

## 3. Deploy The Customer Frontend On Vercel

Create another Vercel project with Root Directory set to `user`.

Set:

```env
VITE_API_BASE_URL=https://your-backend-project.vercel.app
VITE_RAZORPAY_KEY_ID=your_live_or_test_key
```

Deploy and note the URL:

```text
https://your-user-app.vercel.app
```

## 4. Deploy The Admin Frontend On Vercel

Create a third Vercel project with Root Directory set to `admin`.

Set:

```env
VITE_API_BASE_URL=https://your-backend-project.vercel.app
```

Deploy and note the URL:

```text
https://your-admin-app.vercel.app
```

## 5. Update Backend CORS Origins

Once both frontend URLs are known, update the backend Vercel environment variables:

```env
CORS_ORIGIN_CUSTOMER=https://your-user-app.vercel.app
CORS_ORIGIN_ADMIN=https://your-admin-app.vercel.app
```

Redeploy the backend after saving those values.

## 6. Verify Menu Data

Check:

- `https://your-backend-project.vercel.app/menu`
- the customer app home page
- the admin menu manager page

If the local menu items were imported into the hosted MySQL database, the deployed app will show the same data.

## Common Issues

### Menu items are empty

This usually means one of these:

- the hosted MySQL database is empty
- the backend is still pointing at `localhost`
- the import was done into the wrong database name

### Login works locally but not on Vercel

Use these backend settings for cross-site cookies:

- `AUTH_COOKIE_SAME_SITE=none`
- `AUTH_COOKIE_SECURE=true`
- `AUTH_TRUST_PROXY=true`

### CORS blocked errors

Make sure the backend env vars match the exact deployed frontend URLs, including `https://`.

## Notes

- Local MySQL on your own machine cannot be used directly by a public Vercel deployment.
- If you want a single public domain later, put the customer and admin apps on custom subdomains and keep the backend on its own API subdomain.
