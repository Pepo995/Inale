/*
  Warnings:

  - Added the required column `maxCurdMinutes` to the `CheeseType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxCurdTemperature` to the `CheeseType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxMaturationHumidity` to the `CheeseType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxMaturationMinutes` to the `CheeseType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxMaturationTemperature` to the `CheeseType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxSaltingMinutes` to the `CheeseType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxSaltingSalinity` to the `CheeseType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minCurdMinutes` to the `CheeseType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minCurdTemperature` to the `CheeseType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minMaturationHumidity` to the `CheeseType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minMaturationMinutes` to the `CheeseType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minMaturationTemperature` to the `CheeseType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minSaltingMinutes` to the `CheeseType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minSaltingSalinity` to the `CheeseType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CheeseType` ADD COLUMN `bromatologicalForm` VARCHAR(191) NULL,
    ADD COLUMN `deleted` DATETIME(3) NULL,
    ADD COLUMN `maxCurdMinutes` INTEGER NOT NULL,
    ADD COLUMN `maxCurdTemperature` INTEGER NOT NULL,
    ADD COLUMN `maxMaturationHumidity` INTEGER NOT NULL,
    ADD COLUMN `maxMaturationMinutes` INTEGER NOT NULL,
    ADD COLUMN `maxMaturationTemperature` INTEGER NOT NULL,
    ADD COLUMN `maxSaltingMinutes` INTEGER NOT NULL,
    ADD COLUMN `maxSaltingSalinity` INTEGER NOT NULL,
    ADD COLUMN `minCurdMinutes` INTEGER NOT NULL,
    ADD COLUMN `minCurdTemperature` INTEGER NOT NULL,
    ADD COLUMN `minMaturationHumidity` INTEGER NOT NULL,
    ADD COLUMN `minMaturationMinutes` INTEGER NOT NULL,
    ADD COLUMN `minMaturationTemperature` INTEGER NOT NULL,
    ADD COLUMN `minSaltingMinutes` INTEGER NOT NULL,
    ADD COLUMN `minSaltingSalinity` INTEGER NOT NULL,
    ADD COLUMN `registrationCode` VARCHAR(191) NULL;
