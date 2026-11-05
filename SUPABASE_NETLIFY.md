# Supabase and deployment setup

## Local setup: values, destinations, commands

### 1. Create the application secrets file

Use the project-root `.env` file, next to `package.json`. If it does not exist, copy `.env.example` to `.env`; do not overwrite an existing file. Put real values only in `.env` (it is git-ignored), not in source code, chat, screenshots, or `NEXT_PUBLIC_` variables.

Generate a new Auth.js secret in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Paste the generated value in `AUTH_SECRET`. Fill in the remaining values from the Supabase, AllPays, and Resend instructions below:

```dotenv
DATABASE_URL="postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require"

AUTH_SECRET="PASTE_THE_GENERATED_RANDOM_VALUE"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

ALLPAYS_POLYGON_ADDRESS="0xYOUR_40_HEX_CHARACTER_POLYGON_WALLET"
# Optional; defaults to NEXTAUTH_URL + /api/payments/allpays/webhook.
ALLPAYS_CALLBACK_URL="https://YOUR_DOMAIN/api/payments/allpays/webhook"
PAYMENTS_TEST_MODE="false"

SUPABASE_URL="https://PROJECT_REF.supabase.co"
SUPABASE_S3_ENDPOINT="https://PROJECT_REF.supabase.co/storage/v1/s3"
SUPABASE_STORAGE_BUCKET="application-documents"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="YOUR_SUPABASE_S3_ACCESS_KEY"
AWS_SECRET_ACCESS_KEY="YOUR_SUPABASE_S3_SECRET_KEY"
```

Replace every uppercase placeholder. Get `PROJECT_REF`, region, database URLs, and password from **Supabase Dashboard → Project → Connect**. Use the transaction pooler (port `6543`) for `DATABASE_URL` and the session pooler (port `5432`) or Supabase direct connection for `DIRECT_URL`. URL-encode special characters in the database password. The sample `aws-0-REGION` hostname is not literal: use the region and host shown for your project.

### 2. Set up Supabase database and uploads

In **Supabase Dashboard → SQL Editor**, create/open a query. If the project already has this app's tables, open [application-payment.sql](./prisma/application-payment.sql), copy its entire contents, paste into the SQL Editor, and click **Run**. This migrates the payment table and creates the unique-active-checkout index required by the payment integration.

If this is a new, empty database, first use the `prisma db push` command below to create the full app schema, then run [application-payment.sql](./prisma/application-payment.sql) in the SQL Editor as well. Prisma does not represent the partial unique index that prevents two simultaneous checkouts for one application.

In **Supabase Dashboard → Storage**, create a private bucket named `application-documents`. In the Supabase Storage settings, create S3 access credentials and copy the S3 endpoint and access key/secret into `SUPABASE_S3_ENDPOINT`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`. Do not use the Supabase anon key or service-role key as S3 credentials. Allow your local origin (`http://localhost:3000`) for S3 uploads; add the deployed site's origin when deploying.

After the database is reachable, open PowerShell in the repository folder and run:

```powershell
.\node_modules\.bin\prisma.cmd generate
```

For a new, empty database only, create the full schema first, then run `prisma/application-payment.sql` in the Supabase SQL Editor to add the payment-flow-specific partial unique index:

```powershell
.\node_modules\.bin\prisma.cmd db push
.\node_modules\.bin\prisma.cmd generate
```

Do not run `db push` against a database containing data without reviewing the schema changes and taking a backup. For a database with the existing app schema, run the SQL file in Supabase SQL Editor, then run `prisma generate`.

### 3. Configure AllPays hosted card and bank checkout

Use **AllPays.co** (`allpays.co`) and refer to its [API documentation](https://allpays.co/docs) and [OpenAPI specification](https://allpays.co/docs/openapi.json). Set `ALLPAYS_POLYGON_ADDRESS` to the USDC payout wallet on Polygon. Keep it server-side: do not use a `NEXT_PUBLIC_` variable or expose the address configuration in browser code.

When an applicant clicks **Pay $90 with AllPays**, the server creates a unique fixed **$90 USD** payment link for their application with merchant-paid provider fees, sends the applicant's saved country (and US state when applicable) to AllPays payment-method discovery, and redirects to the returned AllPays-hosted checkout URL. AllPays's hosted checkout presents the payment methods available for that transaction, including card, Apple Pay, and bank methods when enabled for the merchant and country. Confirm with AllPays that card and bank methods are enabled for your account and supported in the US and UK. The application stores each created link's verification secret on the server and never returns it to the browser. Keep database access restricted.

The public AllPays API's link-creation endpoint does not require `ALLPAYS_API_KEY` or `ALLPAYS_API_SECRET`; it returns a unique `payment_id` and per-link `payment_secret`. The latter is stored in the database and must remain server-only. Configure `ALLPAYS_POLYGON_ADDRESS` and `NEXTAUTH_URL` in the project-root `.env` and Vercel's **Project Settings → Environment Variables**. `NEXTAUTH_URL` must be the public HTTPS app URL in production and is used to form the webhook URL. Optionally set `ALLPAYS_CALLBACK_URL` to a different public HTTPS URL. When running locally on `localhost`, the integration omits the callback URL because AllPays requires callbacks to be publicly reachable; payment verification still runs when the applicant returns and clicks **VERIFY PAYMENT & SUBMIT**. Redeploy after setting variables.

AllPays sends a signed `GET` callback to `/api/payments/allpays/webhook`. The handler validates the signature using that link's secret, fetches the latest attempt from AllPays, and marks the matching payment and application as paid only when the status is completed, the amount is exactly $90 USD, and `amount_match_checkout` is exact. The applicant can then choose **VERIFY PAYMENT & SUBMIT**. Redirecting back from checkout alone does not confirm payment.

The hosted checkout is a live payment flow and may move real money. Confirm the wallet and fee behavior with AllPays before testing a real payment. The local payment simulator is not an AllPays sandbox.

### 4. Application receipt

No email service is required. After AllPays confirms the $90 USD payment, the applicant can view and print their receipt from their signed-in account. `NEXTAUTH_URL` must still be set to the site's public HTTPS URL in production; it is used to configure the AllPays webhook URL.

The payment screen displays these support contacts:

- Payment questions/issues: `CalPolyPayments@aielevategroup.top` and `accounts@aielevategroup.top`
- Other application issues: `CalpolyPomonaSupport@aielevategroup.top` and `info@aielevategroup.top`

### 5. Install/run and test locally

In PowerShell, from the repository root:

```powershell
npm install
npm run dev
```

If dependencies are already installed, `npm install` is not needed. Open `http://localhost:3000`. Restart the dev server after editing `.env`.

To test the flow without a real AllPays charge, set:

```dotenv
PAYMENTS_TEST_MODE="true"
```

This simulator is available only when `NODE_ENV` is `development`; it does not contact AllPays or transfer funds. However, **VERIFY PAYMENT & SUBMIT** will mark the application submitted in the database configured by `DATABASE_URL` and update its portal status. Use it only with a test application and a non-production database; do not use a real applicant's application or your production database. Turn it off (`false`) before deployment or live payment testing. Real AllPays checkout requires a valid `ALLPAYS_POLYGON_ADDRESS` and an active AllPays account with the desired payment methods enabled.

## Netlify deployment

Connect the repository in Netlify and use the included `netlify.toml` build configuration. Add the variables from `.env.example` in Netlify site environment variables. Set `AUTH_URL` and `NEXTAUTH_URL` to the deployed site URL, and use the same `DATABASE_URL`, `DIRECT_URL`, Supabase Storage endpoint, bucket, and S3 credentials as appropriate for production. Redeploy after setting the variables.

The upload API signs requests server-side; keep the S3 access key and secret private and never prefix them with `NEXT_PUBLIC_`. Configure the Storage bucket's access policies and allowed origins to match the production site. Files are private by default; public file URLs are only generated for records explicitly marked public.

## Vercel deployment

Import the repository into Vercel and leave the framework preset as **Next.js**. No `vercel.json` or custom publish directory is needed. Before deploying, ensure the database schema is current and run `prisma/application-payment.sql` in Supabase SQL Editor so the payment columns and one-active-checkout index exist. Add the production variables from `.env.example` under **Project Settings → Environment Variables**. Set `AUTH_URL` and `NEXTAUTH_URL` to the deployed HTTPS domain, use the Supabase connection strings from **Project → Connect** (not a pinned pooler IP), and configure the AllPays Polygon payout wallet and private Supabase Storage S3 values. Set `PAYMENTS_TEST_MODE=false` or leave it unset in Production. Redeploy after setting variables. Add the production domain as an allowed origin for Supabase Storage uploads.

## Security note

Do not commit `.env` or `.env.local`. The downloaded project contained credentials for its original database provider; replace those values with your Supabase credentials and rotate the old provider credentials if they were real. The `.gitignore` now excludes local environment files, but an already-tracked `.env` must also be removed from version control history separately.