-- CreateTable
CREATE TABLE "company_info" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gst" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "contact_person" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "pin_code" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "company_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Broker" (
    "id" SERIAL NOT NULL,
    "broker_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "bank" TEXT,
    "bank_account" TEXT,
    "ifsc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Broker_pkey" PRIMARY KEY ("id")
);
