/*
  Warnings:

  - Made the column `rut` on table `Dairy` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Dairy` MODIFY `rut` BIGINT NOT NULL;
