-- CreateTable
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
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Task_key_key`(`key`),
    UNIQUE INDEX `Task_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
