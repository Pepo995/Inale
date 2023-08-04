/*
  Warnings:

  - The values [SucessfullyCertified] on the enum `Batch_certified` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Batch` MODIFY `certified` ENUM('WaitingReview', 'SuccessfullyCertified', 'CertificationFailed') NOT NULL DEFAULT 'WaitingReview';
