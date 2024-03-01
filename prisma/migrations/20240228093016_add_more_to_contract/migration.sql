-- AlterTable
ALTER TABLE `contract` ADD COLUMN `paid_amount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `pay_date` DATE NULL;
