-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `amount` DOUBLE NOT NULL,
    `total_amount` DOUBLE NOT NULL,

    INDEX `user_user_name_status_role_idx`(`user_name`, `status`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `customer_name` VARCHAR(50) NOT NULL,
    `customer_id` VARCHAR(50) NULL,
    `address_id` VARCHAR(1000) NULL,
    `phone` VARCHAR(50) NULL,
    `address` VARCHAR(1000) NULL,
    `loan_amount` DOUBLE NOT NULL,
    `receive_amount` DOUBLE NOT NULL,
    `period` VARCHAR(20) NOT NULL,
    `number_period` INTEGER NOT NULL,
    `duration` INTEGER NOT NULL,
    `note` VARCHAR(2000) NULL,
    `receiver` VARCHAR(100) NULL,
    `status` VARCHAR(20) NOT NULL,
    `date_id_card` DATE NULL,
    `date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `contract_user_id_status_date_idx`(`user_id`, `status`, `date`),
    INDEX `contract_customer_name_idx`(`customer_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `contract_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `amount` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `transaction_user_id_idx`(`user_id`),
    INDEX `transaction_contract_id_idx`(`contract_id`),
    INDEX `transaction_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contract` ADD CONSTRAINT `contract_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
