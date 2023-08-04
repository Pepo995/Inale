/*
  Warnings:

  - A unique constraint covering the columns `[blockchainCertificationId]` on the table `Batch` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Batch` ADD COLUMN `blockchainCertificationId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Batch_blockchainCertificationId_key` ON `Batch`(`blockchainCertificationId`);
