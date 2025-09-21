/*
  Warnings:

  - Added the required column `username` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Chat" ADD COLUMN     "username" TEXT NOT NULL;
