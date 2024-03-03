-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `date_transfer` DATE NULL;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contract`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
