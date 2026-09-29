# Supabase and Netlify setup

## Local development

1. Install Node.js 20.9 or newer with Corepack available.
2. Configure the root `.env` using the variable names in `.env.example`; Prisma CLI reads `.env` from the project root. Do not reuse the downloaded builder's `DATABASE_URL`, `AWS_PROFILE`, `AWS_BUCKET_NAME`, or `AWS_FOLDER_PREFIX`. Keep `.env` untracked and enter real credentials only in `.env` or your platform's environment-variable settings.
3. In Supabase, create the `application-documents` Storage bucket (or use the bucket name set in `SUPABASE_STORAGE_BUCKET`). Create S3 credentials under Storage settings and use the S3 endpoint shown there. Put those S3 credentials in `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`; do not use the Supabase anon or service-role API key for S3 uploads.
4. Install dependencies with `corepack yarn install`, then run `corepack yarn dev`. Corepack selects Yarn 4.9.2 to match this repository's lockfile.

Use the Supabase transaction pooler URL on port `6543` for `DATABASE_URL`. Use the session pooler URL on port `5432` for `DIRECT_URL`; if Supabase direct database connections are available in your environment, its direct URL can be used instead. Keep both URLs SSL-enabled and URL-encode special characters in the database password.

For a new, empty Supabase database, apply the existing schema once with `corepack yarn prisma db push`, then create the generated Prisma client with `corepack yarn prisma generate`. `DIRECT_URL` must be set for Prisma CLI operations. Do not run `db push` against a database containing data unless you have reviewed the proposed schema changes and have a backup.

## Netlify deployment

Connect the repository in Netlify and use the included `netlify.toml` build configuration. Add the variables from `.env.example` in Netlify site environment variables. Set `AUTH_URL` and `NEXTAUTH_URL` to the deployed site URL, and use the same `DATABASE_URL`, `DIRECT_URL`, Supabase Storage endpoint, bucket, and S3 credentials as appropriate for production. Redeploy after setting the variables.

The upload API signs requests server-side; keep the S3 access key and secret private and never prefix them with `NEXT_PUBLIC_`. Configure the Storage bucket's access policies and allowed origins to match the production site. Files are private by default; public file URLs are only generated for records explicitly marked public.

## Security note

Do not commit `.env` or `.env.local`. The downloaded project contained credentials for its original database provider; replace those values with your Supabase credentials and rotate the old provider credentials if they were real. The `.gitignore` now excludes local environment files, but an already-tracked `.env` must also be removed from version control history separately.