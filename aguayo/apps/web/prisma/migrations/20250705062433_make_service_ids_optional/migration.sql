-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_providerId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_requesterId_fkey";

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "providerId" DROP NOT NULL,
ALTER COLUMN "requesterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
