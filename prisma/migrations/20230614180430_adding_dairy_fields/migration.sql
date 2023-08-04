-- AlterTable
ALTER TABLE `Dairy` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `companyNumber` INTEGER NULL,
    ADD COLUMN `rut` BIGINT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `name` VARCHAR(191) NULL;
