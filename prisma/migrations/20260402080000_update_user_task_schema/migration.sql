-- Drop existing tables to align with updated schema
DROP TABLE IF EXISTS `Task`;
DROP TABLE IF EXISTS `User`;

-- Create updated User table
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `refreshTokenHash` VARCHAR(191) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_slug_key`(`slug`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create updated Task table with relations
CREATE TABLE `Task` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `space` VARCHAR(191) NULL,
    `workType` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'To do',
    `summary` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `assignee` VARCHAR(191) NULL,
    `reporter` VARCHAR(191) NULL,
    `priority` VARCHAR(191) NULL,
    `labels` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NULL,
    `startDate` DATETIME(3) NULL,
    `category` VARCHAR(191) NULL,
    `team` VARCHAR(191) NULL,
    `userId` INTEGER NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `updatedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Task_key_key`(`key`),
    UNIQUE INDEX `Task_slug_key`(`slug`),
    INDEX `Task_userId_idx`(`userId`),
    INDEX `Task_createdBy_idx`(`createdBy`),
    INDEX `Task_updatedBy_idx`(`updatedBy`),
    PRIMARY KEY (`id`),
    CONSTRAINT `Task_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Task_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Task_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
