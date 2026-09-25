-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN MYSQL / MARIADB (XAMPP)
-- Base de Datos: mjvc_attendance
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `mjvc_attendance` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mjvc_attendance`;

-- 1. TABLA GRUPOS / COORDINACIONES
CREATE TABLE IF NOT EXISTS `groups` (
  `id` VARCHAR(36) NOT NULL,
  `slug` ENUM('PREESCUELA', 'ESCUELA', 'SUPERADMIN') NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `customTitle` VARCHAR(150) NOT NULL,
  `pin` VARCHAR(10) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `groups_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA INTEGRANTES / AUXILIARES
CREATE TABLE IF NOT EXISTS `members` (
  `id` VARCHAR(36) NOT NULL,
  `groupId` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `isAuxiliar` BOOLEAN NOT NULL DEFAULT FALSE,
  `avatarUrl` LONGTEXT NULL,
  `roleSubtitle` VARCHAR(150) NOT NULL DEFAULT 'Integrantes',
  `qrToken` VARCHAR(64) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `members_qrToken_unique` (`qrToken`),
  KEY `members_groupId_idx` (`groupId`),
  CONSTRAINT `members_groupId_fk` FOREIGN KEY (`groupId`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA SESIONES / FECHAS
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(36) NOT NULL,
  `groupId` VARCHAR(36) NOT NULL,
  `label` VARCHAR(50) NOT NULL,
  `sessionDate` DATE NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `sessions_groupId_date_idx` (`groupId`, `sessionDate`),
  CONSTRAINT `sessions_groupId_fk` FOREIGN KEY (`groupId`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA SELLOS DE ASISTENCIA
CREATE TABLE IF NOT EXISTS `attendances` (
  `id` VARCHAR(36) NOT NULL,
  `memberId` VARCHAR(36) NOT NULL,
  `sessionId` VARCHAR(36) NOT NULL,
  `status` ENUM('EMPTY', 'PRESENT', 'LATE', 'ABSENT') NOT NULL DEFAULT 'EMPTY',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendances_member_session_unique` (`memberId`, `sessionId`),
  KEY `attendances_memberId_idx` (`memberId`),
  KEY `attendances_sessionId_idx` (`sessionId`),
  CONSTRAINT `attendances_memberId_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attendances_sessionId_fk` FOREIGN KEY (`sessionId`) REFERENCES `sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLA BITÁCORA Y AUDITORÍA DE HORARIOS
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(36) NOT NULL,
  `groupId` VARCHAR(36) NOT NULL,
  `memberId` VARCHAR(36) NULL,
  `memberName` VARCHAR(150) NOT NULL,
  `sessionName` VARCHAR(100) NOT NULL,
  `status` ENUM('EMPTY', 'PRESENT', 'LATE', 'ABSENT') NOT NULL,
  `coordinatorRole` ENUM('PREESCUELA', 'ESCUELA', 'SUPERADMIN') NOT NULL,
  `registeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_groupId_idx` (`groupId`),
  KEY `audit_logs_registeredAt_idx` (`registeredAt`),
  CONSTRAINT `audit_logs_groupId_fk` FOREIGN KEY (`groupId`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `audit_logs_memberId_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DATOS SEMILLA (SEEDS) INICIALES
-- ============================================================================

INSERT INTO `groups` (`id`, `slug`, `name`, `customTitle`, `pin`) VALUES
('grp_preescuela', 'PREESCUELA', 'Coordinación Preescuela', 'Preescuela', '1234'),
('grp_escuela', 'ESCUELA', 'Coordinación Escuela', 'Escuela', '5678'),
('grp_superadmin', 'SUPERADMIN', 'Super Administrador', 'Super Admin MJVC', '9999')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Sesiones iniciales Preescuela
INSERT INTO `sessions` (`id`, `groupId`, `label`, `sessionDate`) VALUES
('ses_pre_1', 'grp_preescuela', '12/Oct', '2026-10-12'),
('ses_pre_2', 'grp_preescuela', '19/Oct', '2026-10-19'),
('ses_pre_3', 'grp_preescuela', '26/Oct', '2026-10-26'),
('ses_pre_4', 'grp_preescuela', '02/Nov', '2026-11-02')
ON DUPLICATE KEY UPDATE `label` = VALUES(`label`);

-- Miembros iniciales Preescuela
INSERT INTO `members` (`id`, `groupId`, `name`, `isAuxiliar`, `roleSubtitle`, `qrToken`) VALUES
('mem_pre_1', 'grp_preescuela', 'Sofía Rodríguez', TRUE, 'Auxiliares y Guías - Preescuela', 'QR_SOFIA_RODRIGUEZ_PRE123'),
('mem_pre_2', 'grp_preescuela', 'Diego Sánchez', FALSE, 'Integrantes - Preescuela', 'QR_DIEGO_SANCHEZ_PRE456'),
('mem_pre_3', 'grp_preescuela', 'Mateo Ruiz', FALSE, 'Integrantes - Preescuela', 'QR_MATEO_RUIZ_PRE789'),
('mem_pre_4', 'grp_preescuela', 'Valeria Castro', TRUE, 'Auxiliares y Guías - Preescuela', 'QR_VALERIA_CASTRO_PRE321')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Sellos iniciales
INSERT INTO `attendances` (`id`, `memberId`, `sessionId`, `status`) VALUES
('att_1_1', 'mem_pre_1', 'ses_pre_1', 'PRESENT'),
('att_1_2', 'mem_pre_1', 'ses_pre_2', 'PRESENT'),
('att_1_3', 'mem_pre_1', 'ses_pre_3', 'LATE'),
('att_1_4', 'mem_pre_1', 'ses_pre_4', 'PRESENT'),
('att_2_1', 'mem_pre_2', 'ses_pre_1', 'PRESENT'),
('att_2_2', 'mem_pre_2', 'ses_pre_2', 'ABSENT'),
('att_2_3', 'mem_pre_2', 'ses_pre_3', 'PRESENT'),
('att_2_4', 'mem_pre_2', 'ses_pre_4', 'PRESENT'),
('att_3_1', 'mem_pre_3', 'ses_pre_1', 'LATE'),
('att_3_2', 'mem_pre_3', 'ses_pre_2', 'PRESENT'),
('att_3_3', 'mem_pre_3', 'ses_pre_3', 'PRESENT'),
('att_3_4', 'mem_pre_3', 'ses_pre_4', 'PRESENT'),
('att_4_1', 'mem_pre_4', 'ses_pre_1', 'PRESENT'),
('att_4_2', 'mem_pre_4', 'ses_pre_2', 'PRESENT'),
('att_4_3', 'mem_pre_4', 'ses_pre_3', 'PRESENT'),
('att_4_4', 'mem_pre_4', 'ses_pre_4', 'PRESENT')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

