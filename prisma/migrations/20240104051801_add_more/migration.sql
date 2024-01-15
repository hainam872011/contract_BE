/*
  Warnings:

  - A unique constraint covering the columns `[user_name]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `refer_user_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `refer_user_id` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_user_name_key` ON `user`(`user_name`);
