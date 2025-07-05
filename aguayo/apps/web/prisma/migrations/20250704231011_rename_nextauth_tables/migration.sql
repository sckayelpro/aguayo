/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_authUserId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "verification_tokens";

-- CreateTable
CREATE TABLE "nextauth_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "nextauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nextauth_sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nextauth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nextauth_users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "nextauth_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nextauth_verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_accounts_provider_provider_account_id_key" ON "nextauth_accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_sessions_session_token_key" ON "nextauth_sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_users_email_key" ON "nextauth_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_verification_tokens_token_key" ON "nextauth_verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_verification_tokens_identifier_token_key" ON "nextauth_verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "nextauth_accounts" ADD CONSTRAINT "nextauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "nextauth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nextauth_sessions" ADD CONSTRAINT "nextauth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "nextauth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_authUserId_fkey" FOREIGN KEY ("authUserId") REFERENCES "nextauth_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
