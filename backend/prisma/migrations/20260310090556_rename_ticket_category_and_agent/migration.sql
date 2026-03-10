/*
  Warnings:

  - The values [SUPPORT_STAFF] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ticketIssueTypeId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the `TicketIssueType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ticketCategoryId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
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
