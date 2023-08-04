/*
  Warnings:

  - A unique constraint covering the columns `[rut]` on the table `Dairy` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Dairy` ADD COLUMN `branch` ENUM('Maker', 'Controller') NOT NULL DEFAULT 'Maker',
    ADD COLUMN `bromatologicalRegistry` INTEGER NULL,
    ADD COLUMN `contactPhone` VARCHAR(191) NULL,
    ADD COLUMN `dicoseNumber` INTEGER NULL,
    ADD COLUMN `enabledSince` DATETIME(3) NULL,
    ADD COLUMN `endorsementDate` DATETIME(3) NULL,
    ADD COLUMN `registrationCode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Dairy_rut_key` ON `Dairy`(`rut`);
