/*
  Warnings:

  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `role`;

-- CreateTable
CREATE TABLE `SpaceInvite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `spaceId` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `role` VARCHAR(191) NOT NULL DEFAULT 'member',
    `createdBy` INTEGER NOT NULL,
    `acceptedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acceptedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,

    UNIQUE INDEX `SpaceInvite_token_key`(`token`),
    INDEX `SpaceInvite_email_idx`(`email`),
    UNIQUE INDEX `SpaceInvite_spaceId_email_key`(`spaceId`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SpaceInvite` ADD CONSTRAINT `SpaceInvite_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `Space`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
