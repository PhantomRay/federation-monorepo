-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'BANNED', 'DELETED');

-- CreateEnum
CREATE TYPE "OtpMethod" AS ENUM ('EMAIL', 'SMS');

-- CreateTable
CREATE TABLE "user" (
    "id" VARCHAR(12) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "new_email" VARCHAR(100),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "country_code" VARCHAR(6),
    "mobile" VARCHAR(16),
    "new_country_code" VARCHAR(6),
    "new_mobile" VARCHAR(16),
    "mobile_verified" BOOLEAN NOT NULL DEFAULT false,
    "mobile_verified_at" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "type" "UserRole" NOT NULL DEFAULT 'USER',
    "password_hash" VARCHAR(512) NOT NULL,
    "password_set_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salt" VARCHAR(64) NOT NULL,
    "login_failed_count" INTEGER NOT NULL DEFAULT 0,
    "lockout_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "active_at" TIMESTAMP(3),
    "channel" VARCHAR(64),
    "deactivated_at" TIMESTAMP(6),
    "suspended_at" TIMESTAMP(6),
    "suspended_reason" VARCHAR(512),
    "suspended_until" TIMESTAMP(6),
    "suspended_by" VARCHAR(12),
    "banned_at" TIMESTAMP(6),
    "banned_reason" VARCHAR(512),
    "banned_by" VARCHAR(12),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token" (
    "id" TEXT NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "expire_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "uid" VARCHAR(40),
    "ip" VARCHAR(50),

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp" (
    "id" TEXT NOT NULL,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "method" "OtpMethod" NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "salt" VARCHAR(64) NOT NULL,
    "type" VARCHAR(24) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "otp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "email" ON "user"("email");

-- CreateIndex
CREATE INDEX "country_code_mobile" ON "user"("country_code", "mobile");

-- CreateIndex
CREATE UNIQUE INDEX "user_country_code_mobile_key" ON "user"("country_code", "mobile");

-- CreateIndex
CREATE UNIQUE INDEX "otp_userId_method_type_key" ON "otp"("userId", "method", "type");

-- AddForeignKey
ALTER TABLE "token" ADD CONSTRAINT "token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp" ADD CONSTRAINT "otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
