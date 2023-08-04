-- CreateTable
CREATE TABLE `Employee` (
    `document` BIGINT NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `dairyId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`document`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_dairyId_fkey` FOREIGN KEY (`dairyId`) REFERENCES `Dairy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
