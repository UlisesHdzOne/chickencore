/*
  Warnings:

  - You are about to drop the column `event` on the `SecurityLog` table. All the data in the column will be lost.
  - Added the required column `eventType` to the `SecurityLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'PASSWORD_CHANGE', 'EMAIL_VERIFICATION', 'TWO_FACTOR_ENABLED', 'TWO_FACTOR_DISABLED', 'SESSION_LOGOUT', 'ACCOUNT_LOCKED');

-- AlterTable
ALTER TABLE "SecurityLog" DROP COLUMN "event",
ADD COLUMN     "details" TEXT,
ADD COLUMN     "eventType" "SecurityEventType" NOT NULL,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "success" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "userAgent" TEXT;
