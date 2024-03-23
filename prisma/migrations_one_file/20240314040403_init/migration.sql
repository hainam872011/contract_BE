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
    `refer_user_id` INTEGER NULL,

    INDEX `user_user_name_status_role_idx`(`user_name`, `status`, `role`),
    UNIQUE INDEX `user_user_name_key`(`user_name`),
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
    `paid_amount` DOUBLE NOT NULL DEFAULT 0,
    `period` VARCHAR(20) NOT NULL,
    `number_period` INTEGER NOT NULL,
    `duration` INTEGER NOT NULL,
    `collectMoney` BOOLEAN NULL DEFAULT false,
    `note` VARCHAR(2000) NULL,
    `receiver` VARCHAR(100) NULL,
    `status` VARCHAR(20) NOT NULL,
    `date_id_card` DATE NULL,
    `date` DATE NOT NULL,
    `pay_date` DATE NOT NULL,
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
    `is_paid` BOOLEAN NOT NULL DEFAULT false,
    `contract_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `date_transfer` DATE NULL,
    `amount` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `transaction_user_id_idx`(`user_id`),
    INDEX `transaction_contract_id_idx`(`contract_id`),
    INDEX `transaction_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_add_money` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `type` VARCHAR(20) NULL,
    `name` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `transaction_add_money_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contract` ADD CONSTRAINT `contract_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contract`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_add_money` ADD CONSTRAINT `transaction_add_money_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
