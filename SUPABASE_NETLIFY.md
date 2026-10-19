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

ALLPAYS_PAYMENT_ID="pay_YOUR_ACTIVE_PAYMENT_ID"
PAYMENTS_TEST_MODE="false"

RESEND_API_KEY="re_YOUR_RESEND_API_KEY"
EMAIL_FROM="Admissions <admissions@YOUR_VERIFIED_DOMAIN>"

SUPABASE_URL="https://PROJECT_REF.supabase.co"
SUPABASE_S3_ENDPOINT="https://PROJECT_REF.supabase.co/storage/v1/s3"
SUPABASE_STORAGE_BUCKET="application-documents"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="YOUR_SUPABASE_S3_ACCESS_KEY"
AWS_SECRET_ACCESS_KEY="YOUR_SUPABASE_S3_SECRET_KEY"
```

Replace every uppercase placeholder. Get `PROJECT_REF`, region, database URLs, and password from **Supabase Dashboard → Project → Connect**. Use the transaction pooler (port `6543`) for `DATABASE_URL` and the session pooler (port `5432`) or Supabase direct connection for `DIRECT_URL`. URL-encode special characters in the database password. The sample `aws-0-REGION` hostname is not literal: use the region and host shown for your project.

### 2. Set up Supabase database and uploads

In **Supabase Dashboard → SQL Editor**, create/open a query. If the project already has this app's tables, open [application-payment.sql](./prisma/application-payment.sql), copy its entire contents, paste into the SQL Editor, and click **Run**. This creates the payment-attempt table required by the payment integration.

If this is a new, empty database instead, do not run that SQL separately: after filling `DATABASE_URL` and `DIRECT_URL`, use the `prisma db push` command below. The Prisma schema already includes the payment table.

In **Supabase Dashboard → Storage**, create a private bucket named `application-documents`. In the Supabase Storage settings, create S3 access credentials and copy the S3 endpoint and access key/secret into `SUPABASE_S3_ENDPOINT`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`. Do not use the Supabase anon key or service-role key as S3 credentials. Allow your local origin (`http://localhost:3000`) for S3 uploads; add the deployed site's origin when deploying.

After the database is reachable, open PowerShell in the repository folder and run:

```powershell
.\node_modules\.bin\prisma.cmd generate
```

For a new, empty database only, create the full schema first:

```powershell
.\node_modules\.bin\prisma.cmd db push
.\node_modules\.bin\prisma.cmd generate
```

Do not run `db push` against a database containing data without reviewing the schema changes and taking a backup. For a database with the existing app schema, run the SQL file in Supabase SQL Editor instead, then run `prisma generate`.

### 3. Create and configure the AllPays payment link

Use **AllPays.co** (`allpays.co`), not similarly named payment providers. Refer to [AllPays.co API documentation](https://allpays.co/docs) and its [OpenAPI specification](https://allpays.co/docs/openapi.json). In the AllPays dashboard, create an active reusable payment link with:

- Currency: **USD**
- Amount: **90**
- Editable amount: **off** (fixed amount)
- Fee payer: **merchant** if the student should see/pay exactly $90 and the merchant absorbs provider fees; confirm the actual checkout amount shown by AllPays.
- Payout address: your valid Polygon address, as required by AllPays.

Copy only the payment ID (the `pay_...` value) into `ALLPAYS_PAYMENT_ID` in the project-root `.env`. The app starts provider selection and checkout through AllPays' API and checks the payment attempt against its API; it does not use the screenshot's share-link URL as the configured setting. It also does not need the one-time `PAYMENT SECRET` from the screenshot for this API flow. Never paste that secret into the app, `.env`, or browser code. If the screenshot showed a real secret, rotate it in AllPays.

The newly supplied link has been verified through AllPays' public API: it returns HTTP 200 for the link and provider lookup, reports a fixed $90 USD amount, and currently offers Coinbase Pay, Banxa.com, and Binance Connect. The public response did not include a link-level status field, so provider availability is checked by the app at payment time. You can independently verify a link in PowerShell, replacing the example ID:

```powershell
$id = "pay_YOUR_ACTIVE_PAYMENT_ID"
$link = Invoke-RestMethod "https://api.allpays.co/v1/payments/$id"
$link.data.payment | Select-Object payment_id, currency, amount, amount_editable, status
```

Proceed only when it reports the expected ID, `USD`, `90`, `False`, and `active` if the status field is present. AllPays' public API documentation does not specify a sandbox/test-payment mode. A payment through the real hosted checkout may move real money. Do not test a real checkout until you have confirmed the link, provider, payout destination, and fee behavior with AllPays.

The app verifies payment by checking a saved payment-attempt reference with AllPays when the applicant returns and clicks **VERIFY PAYMENT & SUBMIT**. It requires status `completed`, amount `$90 USD`, and an exact checkout amount match. An AllPays browser redirect by itself is not proof of payment. The code does not currently configure or consume an AllPays callback/webhook; do not add a callback URL in the AllPays link unless a separately implemented callback endpoint is provided.

### 4. Configure submission receipt email

Create/verify a sender domain in Resend. In the Resend dashboard, create an API key and paste it into `RESEND_API_KEY`. Put a sender address on the verified domain in `EMAIL_FROM`, for example `Admissions <admissions@yourdomain.com>`. Keep `RESEND_API_KEY` server-side. The applicant's personal, academic, program, and supporting-information fields are included in the receipt email, so use a sender/account approved to handle that applicant data.

`NEXTAUTH_URL` is used to generate the receipt link in the email. Set it to `http://localhost:3000` for local development, and to the exact public HTTPS URL in deployment. Email configuration is required for email delivery; the application submission is recorded even if the email provider reports a delivery failure, and the user is shown the receipt page.

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

This simulator is available only when `NODE_ENV` is `development`; it does not contact AllPays or transfer funds. However, **VERIFY PAYMENT & SUBMIT** will mark the application submitted in the database configured by `DATABASE_URL`, update its portal status, and may send its receipt email. Use it only with a test application and a non-production database; do not use a real applicant's application or your production database. Turn it off (`false`) before deployment or live payment testing. Real AllPays provider/checkout options still require a working AllPays link and API.

## Netlify deployment

Connect the repository in Netlify and use the included `netlify.toml` build configuration. Add the variables from `.env.example` in Netlify site environment variables. Set `AUTH_URL` and `NEXTAUTH_URL` to the deployed site URL, and use the same `DATABASE_URL`, `DIRECT_URL`, Supabase Storage endpoint, bucket, and S3 credentials as appropriate for production. Redeploy after setting the variables.

The upload API signs requests server-side; keep the S3 access key and secret private and never prefix them with `NEXT_PUBLIC_`. Configure the Storage bucket's access policies and allowed origins to match the production site. Files are private by default; public file URLs are only generated for records explicitly marked public.

## Vercel deployment

Import the repository into Vercel and leave the framework preset as **Next.js**. No `vercel.json`, custom publish directory, or Supabase SQL step is needed for Vercel; the payment-attempt table SQL has already been applied to the configured Supabase project. Add the production variables from `.env.example` under **Project Settings → Environment Variables**. Set `AUTH_URL` and `NEXTAUTH_URL` to the deployed HTTPS domain, use the Supabase connection strings from **Project → Connect** (not a pinned pooler IP), and configure the AllPays, Resend, and private Supabase Storage S3 values. Set `PAYMENTS_TEST_MODE=false` or leave it unset in Production. Redeploy after setting variables. Add the production domain as an allowed origin for Supabase Storage uploads.

## Security note

Do not commit `.env` or `.env.local`. The downloaded project contained credentials for its original database provider; replace those values with your Supabase credentials and rotate the old provider credentials if they were real. The `.gitignore` now excludes local environment files, but an already-tracked `.env` must also be removed from version control history separately.