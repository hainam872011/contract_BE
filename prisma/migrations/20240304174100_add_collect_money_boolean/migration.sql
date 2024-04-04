/*
  Warnings:

  - You are about to alter the column `collectMoney` on the `contract` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `contract` MODIFY `collectMoney` BOOLEAN NULL DEFAULT false;
