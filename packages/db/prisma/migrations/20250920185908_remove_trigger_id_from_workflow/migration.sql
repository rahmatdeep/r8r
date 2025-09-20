/*
  Warnings:

  - You are about to drop the column `triggerId` on the `Workflow` table. All the data in the column will be lost.
  - Added the required column `title` to the `Credentials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Credentials" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Workflow" DROP COLUMN "triggerId";
