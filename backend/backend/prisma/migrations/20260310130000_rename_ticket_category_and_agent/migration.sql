-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('AGENT', 'SUPERVISOR', 'MODERATOR');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'AGENT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_ticketIssueTypeId_fkey";

-- DropIndex
DROP INDEX "Ticket_ticketIssueTypeId_idx";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "ticketIssueTypeId",
ADD COLUMN     "ticketCategoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'AGENT';

-- DropTable
DROP TABLE "TicketIssueType";

-- CreateTable
CREATE TABLE "TicketCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TicketCategory_name_key" ON "TicketCategory"("name");

-- CreateIndex
CREATE INDEX "TicketCategory_name_idx" ON "TicketCategory"("name");

-- CreateIndex
CREATE INDEX "Ticket_ticketCategoryId_idx" ON "Ticket"("ticketCategoryId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketCategoryId_fkey" FOREIGN KEY ("ticketCategoryId") REFERENCES "TicketCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

