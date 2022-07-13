-- CreateTable
CREATE TABLE `Pairs` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Pair` VARCHAR(191) NOT NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Pairs_Pair_key`(`Pair`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TickerPrice` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Pair` VARCHAR(191) NOT NULL,
    `Price` DOUBLE NOT NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
