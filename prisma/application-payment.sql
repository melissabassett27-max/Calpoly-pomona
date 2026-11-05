CREATE TABLE IF NOT EXISTS "ApplicationPayment" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "payRequestHash" TEXT,
  "allPaysPaymentId" TEXT,
  "allPaysPaymentSecret" TEXT,
  "hostedCheckoutUrl" TEXT,
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

ALTER TABLE "ApplicationPayment"
  ALTER COLUMN "payRequestHash" DROP NOT NULL;

ALTER TABLE "ApplicationPayment"
  ADD COLUMN IF NOT EXISTS "allPaysPaymentId" TEXT,
  ADD COLUMN IF NOT EXISTS "allPaysPaymentSecret" TEXT,
  ADD COLUMN IF NOT EXISTS "hostedCheckoutUrl" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "ApplicationPayment_payRequestHash_key"
  ON "ApplicationPayment"("payRequestHash");

CREATE UNIQUE INDEX IF NOT EXISTS "ApplicationPayment_allPaysPaymentId_key"
  ON "ApplicationPayment"("allPaysPaymentId");

CREATE UNIQUE INDEX IF NOT EXISTS "ApplicationPayment_oneActiveCheckoutPerApplication_key"
  ON "ApplicationPayment"("applicationId")
  WHERE "status" IN ('creating', 'pending');

CREATE INDEX IF NOT EXISTS "ApplicationPayment_applicationId_createdAt_idx"
  ON "ApplicationPayment"("applicationId", "createdAt");
