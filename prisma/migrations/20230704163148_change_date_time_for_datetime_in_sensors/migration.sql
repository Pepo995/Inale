/*
  Warnings:

  - The primary key for the `CurdSensorData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dateTime` on the `CurdSensorData` table. All the data in the column will be lost.
  - The primary key for the `MaturationSensorData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dateTime` on the `MaturationSensorData` table. All the data in the column will be lost.
  - The primary key for the `SaltingSensorData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dateTime` on the `SaltingSensorData` table. All the data in the column will be lost.
  - Added the required column `datetime` to the `CurdSensorData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `datetime` to the `MaturationSensorData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `datetime` to the `SaltingSensorData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CurdSensorData` DROP PRIMARY KEY,
    DROP COLUMN `dateTime`,
    ADD COLUMN `datetime` DATETIME(0) NOT NULL,
    ADD PRIMARY KEY (`dairyRut`, `datetime`);

-- AlterTable
ALTER TABLE `MaturationSensorData` DROP PRIMARY KEY,
    DROP COLUMN `dateTime`,
    ADD COLUMN `datetime` DATETIME(0) NOT NULL,
    ADD PRIMARY KEY (`dairyRut`, `datetime`);

-- AlterTable
ALTER TABLE `SaltingSensorData` DROP PRIMARY KEY,
    DROP COLUMN `dateTime`,
    ADD COLUMN `datetime` DATETIME(0) NOT NULL,
    ADD PRIMARY KEY (`dairyRut`, `datetime`);
