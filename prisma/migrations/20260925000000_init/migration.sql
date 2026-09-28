-- Migración inicial: MJVC Attendance System
-- Incluye: estados LATE_JUSTIFIED y ABSENT_JUSTIFIED, campo justification

-- Tabla: groups
CREATE TABLE `groups` (
    `id`          VARCHAR(191) NOT NULL,
    `slug`        ENUM('PREESCUELA', 'ESCUELA', 'SUPERADMIN') NOT NULL,
    `name`        VARCHAR(100) NOT NULL,
    `customTitle` VARCHAR(150) NOT NULL,
    `pin`         VARCHAR(10) NOT NULL,
    `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`   DATETIME(3) NOT NULL,

    UNIQUE INDEX `groups_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla: members
CREATE TABLE `members` (
    `id`           VARCHAR(191) NOT NULL,
    `groupId`      VARCHAR(191) NOT NULL,
    `name`         VARCHAR(150) NOT NULL,
    `isAuxiliar`   BOOLEAN NOT NULL DEFAULT false,
    `avatarUrl`    LONGTEXT NULL,
    `roleSubtitle` VARCHAR(150) NOT NULL DEFAULT 'Integrantes',
    `qrToken`      VARCHAR(64) NOT NULL,
    `createdAt`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`    DATETIME(3) NOT NULL,

    UNIQUE INDEX `members_qrToken_key`(`qrToken`),
    INDEX `members_groupId_idx`(`groupId`),
    INDEX `members_qrToken_idx`(`qrToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla: sessions
CREATE TABLE `sessions` (
    `id`          VARCHAR(191) NOT NULL,
    `groupId`     VARCHAR(191) NOT NULL,
    `label`       VARCHAR(50) NOT NULL,
    `sessionDate` DATE NOT NULL,
    `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sessions_groupId_sessionDate_idx`(`groupId`, `sessionDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla: attendances
CREATE TABLE `attendances` (
    `id`            VARCHAR(191) NOT NULL,
    `memberId`      VARCHAR(191) NOT NULL,
    `sessionId`     VARCHAR(191) NOT NULL,
    `status`        ENUM('EMPTY', 'PRESENT', 'LATE', 'LATE_JUSTIFIED', 'ABSENT', 'ABSENT_JUSTIFIED') NOT NULL DEFAULT 'EMPTY',
    `justification` VARCHAR(300) NULL,
    `updatedAt`     DATETIME(3) NOT NULL,

    INDEX `attendances_memberId_idx`(`memberId`),
    INDEX `attendances_sessionId_idx`(`sessionId`),
    UNIQUE INDEX `attendances_memberId_sessionId_key`(`memberId`, `sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla: audit_logs
CREATE TABLE `audit_logs` (
    `id`              VARCHAR(191) NOT NULL,
    `groupId`         VARCHAR(191) NOT NULL,
    `memberId`        VARCHAR(191) NULL,
    `memberName`      VARCHAR(150) NOT NULL,
    `sessionName`     VARCHAR(100) NOT NULL,
    `status`          ENUM('EMPTY', 'PRESENT', 'LATE', 'LATE_JUSTIFIED', 'ABSENT', 'ABSENT_JUSTIFIED') NOT NULL,
    `justification`   VARCHAR(300) NULL,
    `coordinatorRole` ENUM('PREESCUELA', 'ESCUELA', 'SUPERADMIN') NOT NULL,
    `registeredAt`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_groupId_idx`(`groupId`),
    INDEX `audit_logs_registeredAt_idx`(`registeredAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Foreign Keys: members
ALTER TABLE `members`
    ADD CONSTRAINT `members_groupId_fkey`
    FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Keys: sessions
ALTER TABLE `sessions`
    ADD CONSTRAINT `sessions_groupId_fkey`
    FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Keys: attendances
ALTER TABLE `attendances`
    ADD CONSTRAINT `attendances_memberId_fkey`
    FOREIGN KEY (`memberId`) REFERENCES `members`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `attendances`
    ADD CONSTRAINT `attendances_sessionId_fkey`
    FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Keys: audit_logs
ALTER TABLE `audit_logs`
    ADD CONSTRAINT `audit_logs_groupId_fkey`
    FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `audit_logs`
    ADD CONSTRAINT `audit_logs_memberId_fkey`
    FOREIGN KEY (`memberId`) REFERENCES `members`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
