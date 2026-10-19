CREATE TABLE IF NOT EXISTS "ApplicationPayment" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "payRequestHash" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "currency" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicationPayment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ApplicationPayment_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ApplicationPayment_payRequestHash_key"
  ON "ApplicationPayment"("payRequestHash");

CREATE INDEX IF NOT EXISTS "ApplicationPayment_applicationId_createdAt_idx"
  ON "ApplicationPayment"("applicationId", "createdAt");
