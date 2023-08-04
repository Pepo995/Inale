-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dairy` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `producerId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Dairy_producerId_key`(`producerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheeseType` (
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DairyCheeseType` (
    `dairyId` VARCHAR(191) NOT NULL,
    `cheeseTypeName` VARCHAR(191) NOT NULL,

    INDEX `DairyCheeseType_dairyId_idx`(`dairyId`),
    INDEX `DairyCheeseType_cheeseTypeName_idx`(`cheeseTypeName`),
    PRIMARY KEY (`dairyId`, `cheeseTypeName`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Batch` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dairyId` VARCHAR(191) NOT NULL,
    `cheeseTypeName` VARCHAR(191) NOT NULL,
    `batchName` VARCHAR(191) NULL,
    `curdInitDateTime` DATETIME(3) NULL,
    `saltingInitDateTime` DATETIME(3) NULL,
    `maturationInitDateTime` DATETIME(3) NULL,
    `maturationEndDateTime` DATETIME(3) NULL,
    `initialVolume` DOUBLE NULL,
    `weightBeforeSalting` DOUBLE NULL,
    `weightAfterMaturation` DOUBLE NULL,
    `certified` ENUM('WaitingReview', 'SucessfullyCertified', 'CertificationFailed') NOT NULL DEFAULT 'WaitingReview',
    `started` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Batch_dairyId_cheeseTypeName_idx`(`dairyId`, `cheeseTypeName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CurdSensorData` (
    `dairyId` VARCHAR(191) NOT NULL,
    `dateTime` DATETIME(0) NOT NULL,
    `temperature` DOUBLE NOT NULL,

    INDEX `CurdSensorData_dairyId_idx`(`dairyId`),
    PRIMARY KEY (`dairyId`, `dateTime`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SaltingSensorData` (
    `dairyId` VARCHAR(191) NOT NULL,
    `dateTime` DATETIME(0) NOT NULL,
    `salinity` DOUBLE NOT NULL,

    INDEX `SaltingSensorData_dairyId_idx`(`dairyId`),
    PRIMARY KEY (`dairyId`, `dateTime`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaturationSensorData` (
    `dairyId` VARCHAR(191) NOT NULL,
    `dateTime` DATETIME(0) NOT NULL,
    `temperature` DOUBLE NOT NULL,
    `humidity` DOUBLE NOT NULL,

    INDEX `MaturationSensorData_dairyId_idx`(`dairyId`),
    PRIMARY KEY (`dairyId`, `dateTime`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Dairy` ADD CONSTRAINT `Dairy_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DairyCheeseType` ADD CONSTRAINT `DairyCheeseType_dairyId_fkey` FOREIGN KEY (`dairyId`) REFERENCES `Dairy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DairyCheeseType` ADD CONSTRAINT `DairyCheeseType_cheeseTypeName_fkey` FOREIGN KEY (`cheeseTypeName`) REFERENCES `CheeseType`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Batch` ADD CONSTRAINT `Batch_dairyId_cheeseTypeName_fkey` FOREIGN KEY (`dairyId`, `cheeseTypeName`) REFERENCES `DairyCheeseType`(`dairyId`, `cheeseTypeName`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CurdSensorData` ADD CONSTRAINT `CurdSensorData_dairyId_fkey` FOREIGN KEY (`dairyId`) REFERENCES `Dairy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaltingSensorData` ADD CONSTRAINT `SaltingSensorData_dairyId_fkey` FOREIGN KEY (`dairyId`) REFERENCES `Dairy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaturationSensorData` ADD CONSTRAINT `MaturationSensorData_dairyId_fkey` FOREIGN KEY (`dairyId`) REFERENCES `Dairy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
