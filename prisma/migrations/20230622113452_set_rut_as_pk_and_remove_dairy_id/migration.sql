/*
  Warnings:

  - You are about to drop the column `dairyId` on the `Batch` table. All the data in the column will be lost.
  - The primary key for the `CurdSensorData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dairyId` on the `CurdSensorData` table. All the data in the column will be lost.
  - The primary key for the `Dairy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Dairy` table. All the data in the column will be lost.
  - The primary key for the `DairyCheeseType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dairyId` on the `DairyCheeseType` table. All the data in the column will be lost.
  - You are about to drop the column `dairyId` on the `Employee` table. All the data in the column will be lost.
  - The primary key for the `MaturationSensorData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dairyId` on the `MaturationSensorData` table. All the data in the column will be lost.
  - The primary key for the `SaltingSensorData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dairyId` on the `SaltingSensorData` table. All the data in the column will be lost.
  - Added the required column `dairyRut` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dairyRut` to the `CurdSensorData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dairyRut` to the `DairyCheeseType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dairyRut` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dairyRut` to the `MaturationSensorData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dairyRut` to the `SaltingSensorData` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Batch` DROP FOREIGN KEY `Batch_dairyId_cheeseTypeName_fkey`;

-- DropForeignKey
ALTER TABLE `CurdSensorData` DROP FOREIGN KEY `CurdSensorData_dairyId_fkey`;

-- DropForeignKey
ALTER TABLE `DairyCheeseType` DROP FOREIGN KEY `DairyCheeseType_dairyId_fkey`;

-- DropForeignKey
ALTER TABLE `Employee` DROP FOREIGN KEY `Employee_dairyId_fkey`;

-- DropForeignKey
ALTER TABLE `MaturationSensorData` DROP FOREIGN KEY `MaturationSensorData_dairyId_fkey`;

-- DropForeignKey
ALTER TABLE `SaltingSensorData` DROP FOREIGN KEY `SaltingSensorData_dairyId_fkey`;

-- DropIndex
DROP INDEX `Dairy_rut_key` ON `Dairy`;

-- DropIndex
DROP INDEX `Batch_dairyId_cheeseTypeName_idx` ON `Batch`;

-- AlterTable
ALTER TABLE `Batch` DROP COLUMN `dairyId`,
    ADD COLUMN `dairyRut` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `CurdSensorData` DROP PRIMARY KEY,
    DROP COLUMN `dairyId`,
    ADD COLUMN `dairyRut` BIGINT NOT NULL,
    ADD PRIMARY KEY (`dairyRut`, `dateTime`);

-- AlterTable
ALTER TABLE `Dairy` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`rut`);

-- AlterTable
ALTER TABLE `DairyCheeseType` DROP PRIMARY KEY,
    DROP COLUMN `dairyId`,
    ADD COLUMN `dairyRut` BIGINT NOT NULL,
    ADD PRIMARY KEY (`dairyRut`, `cheeseTypeName`);

-- AlterTable
ALTER TABLE `Employee` DROP COLUMN `dairyId`,
    ADD COLUMN `dairyRut` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `MaturationSensorData` DROP PRIMARY KEY,
    DROP COLUMN `dairyId`,
    ADD COLUMN `dairyRut` BIGINT NOT NULL,
    ADD PRIMARY KEY (`dairyRut`, `dateTime`);

-- AlterTable
ALTER TABLE `SaltingSensorData` DROP PRIMARY KEY,
    DROP COLUMN `dairyId`,
    ADD COLUMN `dairyRut` BIGINT NOT NULL,
    ADD PRIMARY KEY (`dairyRut`, `dateTime`);

-- CreateIndex
CREATE INDEX `Batch_dairyRut_cheeseTypeName_idx` ON `Batch`(`dairyRut`, `cheeseTypeName`);

-- CreateIndex
CREATE INDEX `CurdSensorData_dairyRut_idx` ON `CurdSensorData`(`dairyRut`);

-- CreateIndex
CREATE INDEX `DairyCheeseType_dairyRut_idx` ON `DairyCheeseType`(`dairyRut`);

-- CreateIndex
CREATE INDEX `MaturationSensorData_dairyRut_idx` ON `MaturationSensorData`(`dairyRut`);

-- CreateIndex
CREATE INDEX `SaltingSensorData_dairyRut_idx` ON `SaltingSensorData`(`dairyRut`);

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_dairyRut_fkey` FOREIGN KEY (`dairyRut`) REFERENCES `Dairy`(`rut`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DairyCheeseType` ADD CONSTRAINT `DairyCheeseType_dairyRut_fkey` FOREIGN KEY (`dairyRut`) REFERENCES `Dairy`(`rut`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Batch` ADD CONSTRAINT `Batch_dairyRut_cheeseTypeName_fkey` FOREIGN KEY (`dairyRut`, `cheeseTypeName`) REFERENCES `DairyCheeseType`(`dairyRut`, `cheeseTypeName`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CurdSensorData` ADD CONSTRAINT `CurdSensorData_dairyRut_fkey` FOREIGN KEY (`dairyRut`) REFERENCES `Dairy`(`rut`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaltingSensorData` ADD CONSTRAINT `SaltingSensorData_dairyRut_fkey` FOREIGN KEY (`dairyRut`) REFERENCES `Dairy`(`rut`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaturationSensorData` ADD CONSTRAINT `MaturationSensorData_dairyRut_fkey` FOREIGN KEY (`dairyRut`) REFERENCES `Dairy`(`rut`) ON DELETE RESTRICT ON UPDATE CASCADE;
