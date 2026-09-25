-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN PARA SUPABASE (POSTGRESQL)
-- ============================================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE "RoleType" AS ENUM ('PREESCUELA', 'ESCUELA', 'SUPERADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AttendanceStatus" AS ENUM ('EMPTY', 'PRESENT', 'LATE', 'ABSENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLA GRUPOS
CREATE TABLE IF NOT EXISTS public.groups (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug "RoleType" UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    "customTitle" VARCHAR(150) NOT NULL,
    pin VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. TABLA INTEGRANTES / AUXILIARES
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "groupId" TEXT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    "isAuxiliar" BOOLEAN DEFAULT FALSE NOT NULL,
    "avatarUrl" TEXT,
    "roleSubtitle" VARCHAR(150) DEFAULT 'Integrantes' NOT NULL,
    "qrToken" VARCHAR(64) UNIQUE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_members_group_id ON public.members("groupId");
CREATE INDEX IF NOT EXISTS idx_members_qr_token ON public.members("qrToken");

-- 4. TABLA SESIONES
CREATE TABLE IF NOT EXISTS public.sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "groupId" TEXT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    "sessionDate" DATE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_group_date ON public.sessions("groupId", "sessionDate");

-- 5. TABLA ASISTENCIAS / SELLOS
CREATE TABLE IF NOT EXISTS public.attendances (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "memberId" TEXT NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    "sessionId" TEXT NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    status "AttendanceStatus" DEFAULT 'EMPTY' NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_member_session UNIQUE ("memberId", "sessionId")
);

CREATE INDEX IF NOT EXISTS idx_attendances_member ON public.attendances("memberId");
CREATE INDEX IF NOT EXISTS idx_attendances_session ON public.attendances("sessionId");

-- 6. TABLA BITÁCORA / AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "groupId" TEXT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    "memberId" TEXT REFERENCES public.members(id) ON DELETE SET NULL,
    "memberName" VARCHAR(150) NOT NULL,
    "sessionName" VARCHAR(100) NOT NULL,
    status "AttendanceStatus" NOT NULL,
    "coordinatorRole" "RoleType" NOT NULL,
    "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_group ON public.audit_logs("groupId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_registered ON public.audit_logs("registeredAt");

-- ============================================================================
-- DATOS SEMILLA PARA SUPABASE
-- ============================================================================

INSERT INTO public.groups (id, slug, name, "customTitle", pin) VALUES
('grp_preescuela', 'PREESCUELA', 'Coordinación Preescuela', 'Preescuela', '1234'),
('grp_escuela', 'ESCUELA', 'Coordinación Escuela', 'Escuela', '5678'),
('grp_superadmin', 'SUPERADMIN', 'Super Administrador', 'Super Admin MJVC', '9999')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.sessions (id, "groupId", label, "sessionDate") VALUES
('ses_pre_1', 'grp_preescuela', '12/Oct', '2026-10-12'),
('ses_pre_2', 'grp_preescuela', '19/Oct', '2026-10-19'),
('ses_pre_3', 'grp_preescuela', '26/Oct', '2026-10-26'),
('ses_pre_4', 'grp_preescuela', '02/Nov', '2026-11-02')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.members (id, "groupId", name, "isAuxiliar", "roleSubtitle", "qrToken") VALUES
('mem_pre_1', 'grp_preescuela', 'Sofía Rodríguez', TRUE, 'Auxiliares y Guías - Preescuela', 'QR_SOFIA_RODRIGUEZ_PRE123'),
('mem_pre_2', 'grp_preescuela', 'Diego Sánchez', FALSE, 'Integrantes - Preescuela', 'QR_DIEGO_SANCHEZ_PRE456'),
('mem_pre_3', 'grp_preescuela', 'Mateo Ruiz', FALSE, 'Integrantes - Preescuela', 'QR_MATEO_RUIZ_PRE789'),
('mem_pre_4', 'grp_preescuela', 'Valeria Castro', TRUE, 'Auxiliares y Guías - Preescuela', 'QR_VALERIA_CASTRO_PRE321')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.attendances (id, "memberId", "sessionId", status) VALUES
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
ON CONFLICT ("memberId", "sessionId") DO UPDATE SET status = EXCLUDED.status;

