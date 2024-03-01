/*
  Warnings:

  - Made the column `pay_date` on table `contract` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `contract` MODIFY `pay_date` DATE NOT NULL;
