import React, { useState } from 'react';
import {
  Database,
  Shield,
  Lock,
  Key,
  Copy,
  CheckCircle,
  Eye,
  FileCode,
  Layers,
  Server,
  Terminal,
  UserCheck,
  AlertTriangle,
  FileText,
} from 'lucide-react';

const DDL_SQL = `-- ============================================================================
-- K-12 Multi-Tenant Relational Schema & Compliance Foundation (PostgreSQL)
-- Target: PostgreSQL 14+ / 15+ / 16+ (FERPA & GDPR Compliance Ready)
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enumerations
CREATE TYPE user_role AS ENUM (
    'super_admin',
    'school_admin',
    'teacher',
    'student',
    'parent'
);

CREATE TYPE attendance_status AS ENUM (
    'present',
    'absent',
    'tardy',
    'excused'
);

-- 3. Automatic updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Multi-Tenant Identifier: Schools
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    moe_registration_code VARCHAR(100) UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_schools_updated_at
BEFORE UPDATE ON schools
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- 5. Core Users Table (Federated with Auth Provider)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY, -- Matches Auth Identity Provider (e.g. Supabase/Firebase/Auth0)
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_school_email UNIQUE (school_id, email)
);

CREATE INDEX idx_users_school_role ON users(school_id, role);
CREATE INDEX idx_users_email ON users(email);

CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- 6. Role-Specific Profiles (FERPA/GDPR Sensitive Data Encapsulation)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    grade_level VARCHAR(50),
    national_id_number VARCHAR(100),
    primary_contact_phone VARCHAR(50),
    residential_address TEXT,
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(50),
    medical_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_grade_level ON profiles(grade_level);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- 7. Parent-Student Relationship Mapping (FERPA Verification Bridge)
CREATE TABLE IF NOT EXISTS parent_student_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'parent_guardian',
    is_authorized_pickup BOOLEAN NOT NULL DEFAULT TRUE,
    is_emergency_contact BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_parent_student_link UNIQUE (parent_id, student_id)
);

CREATE INDEX idx_psm_parent_id ON parent_student_map(parent_id);
CREATE INDEX idx_psm_student_id ON parent_student_map(student_id);
CREATE INDEX idx_psm_school_id ON parent_student_map(school_id);

-- 8. Classes (Academic Course Offerings)
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    academic_year VARCHAR(50) NOT NULL,
    term_period VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_academic_year ON classes(school_id, academic_year);

CREATE TRIGGER set_classes_updated_at
BEFORE UPDATE ON classes
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- 9. Enrollments (Student-to-Class Registration)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_class_student_enrollment UNIQUE (class_id, student_id)
);

CREATE INDEX idx_enrollments_class_id ON enrollments(class_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);

-- 10. Continuous Assessment & Grades
CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    assignment_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'continuous_assessment', -- 'quiz', 'midterm', 'final_exam'
    score_achieved NUMERIC(6, 2) NOT NULL CHECK (score_achieved >= 0),
    max_score NUMERIC(6, 2) NOT NULL CHECK (max_score > 0),
    letter_grade VARCHAR(5),
    graded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_score_within_bounds CHECK (score_achieved <= max_score)
);

CREATE INDEX idx_grades_enrollment_id ON grades(enrollment_id);
CREATE INDEX idx_grades_graded_by ON grades(graded_by);

CREATE TRIGGER set_grades_updated_at
BEFORE UPDATE ON grades
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- 11. Attendance Records
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status NOT NULL DEFAULT 'present',
    marked_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    remarks VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_class_daily_attendance UNIQUE (student_id, class_id, date)
);

CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);
CREATE INDEX idx_attendance_marked_by ON attendance(marked_by);

CREATE TRIGGER set_attendance_updated_at
BEFORE UPDATE ON attendance
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();
`;

const RLS_SQL = `-- ============================================================================
-- PostgreSQL Row-Level Security (RLS) & Multi-Tenant Access Control Layer
-- ============================================================================

-- 1. Helper Functions to Extract Session Context (Safe with Default Fallbacks)
CREATE OR REPLACE FUNCTION app_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app_current_school_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_school_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app_current_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_role', true), '')::user_role;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Turn On and Force RLS on All Tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools FORCE ROW LEVEL SECURITY;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE parent_student_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_map FORCE ROW LEVEL SECURITY;

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes FORCE ROW LEVEL SECURITY;

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments FORCE ROW LEVEL SECURITY;

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades FORCE ROW LEVEL SECURITY;

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. POLICIES: schools
-- ============================================================================
CREATE POLICY schools_super_admin_all ON schools
    FOR ALL
    USING (app_current_user_role() = 'super_admin');

CREATE POLICY schools_tenant_read ON schools
    FOR SELECT
    USING (id = app_current_school_id());

-- ============================================================================
-- 4. POLICIES: users
-- ============================================================================
CREATE POLICY users_super_admin_all ON users
    FOR ALL
    USING (app_current_user_role() = 'super_admin');

CREATE POLICY users_school_admin_all ON users
    FOR ALL
    USING (
        app_current_user_role() = 'school_admin'
        AND school_id = app_current_school_id()
    )
    WITH CHECK (
        app_current_user_role() = 'school_admin'
        AND school_id = app_current_school_id()
    );

CREATE POLICY users_teacher_read ON users
    FOR SELECT
    USING (
        app_current_user_role() = 'teacher'
        AND school_id = app_current_school_id()
    );

CREATE POLICY users_student_self_read ON users
    FOR SELECT
    USING (
        app_current_user_role() = 'student'
        AND id = app_current_user_id()
        AND school_id = app_current_school_id()
    );

CREATE POLICY users_parent_read ON users
    FOR SELECT
    USING (
        app_current_user_role() = 'parent'
        AND school_id = app_current_school_id()
        AND (
            id = app_current_user_id()
            OR id IN (
                SELECT student_id 
                FROM parent_student_map 
                WHERE parent_id = app_current_user_id()
            )
        )
    );

-- ============================================================================
-- 5. POLICIES: profiles (FERPA / GDPR Protected)
-- ============================================================================
CREATE POLICY profiles_super_admin_all ON profiles
    FOR ALL
    USING (app_current_user_role() = 'super_admin');

CREATE POLICY profiles_school_admin_all ON profiles
    FOR ALL
    USING (
        app_current_user_role() = 'school_admin'
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = profiles.user_id 
            AND users.school_id = app_current_school_id()
        )
    );

CREATE POLICY profiles_teacher_read ON profiles
    FOR SELECT
    USING (
        app_current_user_role() = 'teacher'
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = profiles.user_id 
            AND users.school_id = app_current_school_id()
        )
    );

CREATE POLICY profiles_student_self ON profiles
    FOR SELECT
    USING (
        app_current_user_role() = 'student'
        AND user_id = app_current_user_id()
    );

CREATE POLICY profiles_parent_read ON profiles
    FOR SELECT
    USING (
        app_current_user_role() = 'parent'
        AND (
            user_id = app_current_user_id()
            OR user_id IN (
                SELECT student_id 
                FROM parent_student_map 
                WHERE parent_id = app_current_user_id()
            )
        )
    );

-- ============================================================================
-- 6. POLICIES: parent_student_map
-- ============================================================================
CREATE POLICY psm_super_admin_all ON parent_student_map
    FOR ALL
    USING (app_current_user_role() = 'super_admin');

CREATE POLICY psm_school_admin_all ON parent_student_map
    FOR ALL
    USING (
        app_current_user_role() = 'school_admin'
        AND school_id = app_current_school_id()
    );

CREATE POLICY psm_teacher_read ON parent_student_map
    FOR SELECT
    USING (
        app_current_user_role() = 'teacher'
        AND school_id = app_current_school_id()
    );

CREATE POLICY psm_parent_self ON parent_student_map
    FOR SELECT
    USING (
        app_current_user_role() = 'parent'
        AND parent_id = app_current_user_id()
        AND school_id = app_current_school_id()
    );

CREATE POLICY psm_student_self ON parent_student_map
    FOR SELECT
    USING (
        app_current_user_role() = 'student'
        AND student_id = app_current_user_id()
        AND school_id = app_current_school_id()
    );

-- ============================================================================
-- 7. POLICIES: classes
-- ============================================================================
CREATE POLICY classes_super_admin_all ON classes
    FOR ALL
    USING (app_current_user_role() = 'super_admin');

CREATE POLICY classes_school_admin_all ON classes
    FOR ALL
    USING (
        app_current_user_role() = 'school_admin'
        AND school_id = app_current_school_id()
    );

CREATE POLICY classes_teacher_access ON classes
    FOR ALL
    USING (
        app_current_user_role() = 'teacher'
        AND school_id = app_current_school_id()
    );

CREATE POLICY classes_student_read ON classes
    FOR SELECT
    USING (
        app_current_user_role() = 'student'
        AND school_id = app_current_school_id()
        AND id IN (
            SELECT class_id FROM enrollments 
            WHERE student_id = app_current_user_id()
        )
    );

CREATE POLICY classes_parent_read ON classes
    FOR SELECT
    USING (
        app_current_user_role() = 'parent'
        AND school_id = app_current_school_id()
        AND id IN (
            SELECT e.class_id 
            FROM enrollments e
            JOIN parent_student_map psm ON psm.student_id = e.student_id
            WHERE psm.parent_id = app_current_user_id()
        )
    );

-- ============================================================================
-- 8. POLICIES: enrollments
-- ============================================================================
CREATE POLICY enrollments_super_admin_all ON enrollments
    FOR ALL
    USING (app_current_user_role() = 'super_admin');

CREATE POLICY enrollments_school_admin_all ON enrollments
    FOR ALL
    USING (
        app_current_user_role() = 'school_admin'
        AND EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = enrollments.class_id 
            AND classes.school_id = app_current_school_id()
        )
    );

CREATE POLICY enrollments_teacher_read ON enrollments
    FOR SELECT
    USING (
        app_current_user_role() = 'teacher'
        AND EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = enrollments.class_id 
            AND classes.school_id = app_current_school_id()
        )
    );

CREATE POLICY enrollments_student_self ON enrollments
    FOR SELECT
    USING (
        app_current_user_role() = 'student'
        AND student_id = app_current_user_id()
    );

CREATE POLICY enrollments_parent_read ON enrollments
    FOR SELECT
    USING (
        app_current_user_role() = 'parent'
        AND student_id IN (
            SELECT student_id 
            FROM parent_student_map 
            WHERE parent_id = app_current_user_id()
        )
    );

-- ============================================================================
-- 9. POLICIES: grades (Strict FERPA & Teacher Assignment Protection)
-- ============================================================================
CREATE POLICY grades_super_admin_all ON grades
    FOR ALL
    USING (app_current_user_role() = 'super_admin');

CREATE POLICY grades_school_admin_all ON grades
    FOR ALL
    USING (
        app_current_user_role() = 'school_admin'
        AND EXISTS (
            SELECT 1 FROM enrollments e
            JOIN classes c ON c.id = e.class_id
            WHERE e.id = grades.enrollment_id
            AND c.school_id = app_current_school_id()
        )
    );

-- Teacher can read all grades in their school
CREATE POLICY grades_teacher_read ON grades
    FOR SELECT
    USING (
        app_current_user_role() = 'teacher'
        AND EXISTS (
            SELECT 1 FROM enrollments e
            JOIN classes c ON c.id = e.class_id
            WHERE e.id = grades.enrollment_id
            AND c.school_id = app_current_school_id()
        )
    );

-- Teacher can INSERT/UPDATE/DELETE ONLY for their assigned classes
CREATE POLICY grades_teacher_write ON grades
    FOR ALL
    USING (
        app_current_user_role() = 'teacher'
        AND EXISTS (
            SELECT 1 FROM enrollments e
            JOIN classes c ON c.id = e.class_id
            WHERE e.id = grades.enrollment_id
            AND c.teacher_id = app_current_user_id()
            AND c.school_id = app_current_school_id()
        )
    )
    WITH CHECK (
        app_current_user_role() = 'teacher'
        AND graded_by = app_current_user_id()
        AND EXISTS (
            SELECT 1 FROM enrollments e
            JOIN classes c ON c.id = e.class_id
            WHERE e.id = grades.enrollment_id
            AND c.teacher_id = app_current_user_id()
            AND c.school_id = app_current_school_id()
        )
    );

-- Student can only read their own grades
CREATE POLICY grades_student_self_read ON grades
    FOR SELECT
    USING (
        app_current_user_role() = 'student'
        AND EXISTS (
            SELECT 1 FROM enrollments e
            WHERE e.id = grades.enrollment_id
            AND e.student_id = app_current_user_id()
        )
    );

-- Parent can only read grades for their linked children
CREATE POLICY grades_parent_child_read ON grades
    FOR SELECT
    USING (
        app_current_user_role() = 'parent'
        AND EXISTS (
            SELECT 1 FROM enrollments e
            JOIN parent_student_map psm ON psm.student_id = e.student_id
            WHERE e.id = grades.enrollment_id
            AND psm.parent_id = app_current_user_id()
        )
    );

-- ============================================================================
-- 10. POLICIES: attendance (Daily Roll-Call & Absence Tracking)
-- ============================================================================
CREATE POLICY attendance_super_admin_all ON attendance
    FOR ALL
    USING (app_current_user_role() = 'super_admin');

CREATE POLICY attendance_school_admin_all ON attendance
    FOR ALL
    USING (
        app_current_user_role() = 'school_admin'
        AND EXISTS (
            SELECT 1 FROM classes c
            WHERE c.id = attendance.class_id
            AND c.school_id = app_current_school_id()
        )
    );

-- Teacher can read attendance across classes in their school
CREATE POLICY attendance_teacher_read ON attendance
    FOR SELECT
    USING (
        app_current_user_role() = 'teacher'
        AND EXISTS (
            SELECT 1 FROM classes c
            WHERE c.id = attendance.class_id
            AND c.school_id = app_current_school_id()
        )
    );

-- Teacher can ONLY mark/modify attendance for classes they teach
CREATE POLICY attendance_teacher_write ON attendance
    FOR ALL
    USING (
        app_current_user_role() = 'teacher'
        AND EXISTS (
            SELECT 1 FROM classes c
            WHERE c.id = attendance.class_id
            AND c.teacher_id = app_current_user_id()
            AND c.school_id = app_current_school_id()
        )
    )
    WITH CHECK (
        app_current_user_role() = 'teacher'
        AND marked_by = app_current_user_id()
        AND EXISTS (
            SELECT 1 FROM classes c
            WHERE c.id = attendance.class_id
            AND c.teacher_id = app_current_user_id()
            AND c.school_id = app_current_school_id()
        )
    );

-- Student can only read their own attendance
CREATE POLICY attendance_student_self ON attendance
    FOR SELECT
    USING (
        app_current_user_role() = 'student'
        AND student_id = app_current_user_id()
    );

-- Parent can only read attendance of their linked children
CREATE POLICY attendance_parent_child ON attendance
    FOR SELECT
    USING (
        app_current_user_role() = 'parent'
        AND student_id IN (
            SELECT student_id 
            FROM parent_student_map 
            WHERE parent_id = app_current_user_id()
        )
    );
`;

const BACKEND_TS_CODE = `// ============================================================================
// PostgreSQL Session Context Middleware (Node.js / Express / TypeScript)
// Secures DB connection pools with SET LOCAL per HTTP transaction
// ============================================================================
import { Pool, PoolClient } from 'pg';
import { Request, Response, NextFunction } from 'express';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

export interface AuthContextRequest extends Request {
  user?: {
    id: string;
    schoolId: string;
    role: 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';
    email: string;
  };
}

/**
 * Execute transactional query with RLS context variables applied locally.
 * SET LOCAL ensures context is automatically cleared when transaction commits or rolls back!
 */
export async function withTenantContext<T>(
  req: AuthContextRequest,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Securely inject authenticated claims into the PostgreSQL session
    if (req.user) {
      await client.query(
        \`
        SELECT 
          set_config('app.current_user_id', $1, true),
          set_config('app.current_school_id', $2, true),
          set_config('app.current_user_role', $3, true);
        \`,
        [req.user.id, req.user.schoolId, req.user.role]
      );
    }

    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Example Express Route: Grade Entry (Protected by RLS)
 */
export async function submitGradeHandler(req: AuthContextRequest, res: Response) {
  try {
    const { enrollmentId, assignmentName, scoreAchieved, maxScore } = req.body;

    const savedGrade = await withTenantContext(req, async (client) => {
      const res = await client.query(
        \`
        INSERT INTO grades (enrollment_id, assignment_name, score_achieved, max_score, graded_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        \`,
        [enrollmentId, assignmentName, scoreAchieved, maxScore, req.user!.id]
      );
      return res.rows[0];
    });

    return res.status(201).json({ success: true, grade: savedGrade });
  } catch (err: any) {
    // If a teacher tries to grade another teacher's class, PostgreSQL RLS raises a 42501 (insufficient_privilege)
    return res.status(403).json({ error: 'Unauthorized: RLS permission denied.', details: err.message });
  }
}
`;

export const DatabaseSecurityExplorer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'api_runner' | 'ddl' | 'rls' | 'backend'>('api_runner');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [simulatedRole, setSimulatedRole] = useState<string>('teacher');
  const [apiEndpoint, setApiEndpoint] = useState<string>('/api/health');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST' | 'PATCH'>('GET');
  const [apiPayload, setApiPayload] = useState<string>('');
  const [apiResult, setApiResult] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [apiStatusCode, setApiStatusCode] = useState<number | null>(null);
  const [apiDuration, setApiDuration] = useState<number | null>(null);

  const runLiveApi = async (endpoint: string, method: string = 'GET', payload?: any) => {
    setApiLoading(true);
    setApiEndpoint(endpoint);
    setApiMethod(method as any);
    if (payload) {
      setApiPayload(JSON.stringify(payload, null, 2));
    } else {
      setApiPayload('');
    }

    const startTime = performance.now();
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-role': simulatedRole,
        'x-school-id': 'sch-savina-monrovia',
      };

      if (simulatedRole === 'student') {
        headers['x-user-id'] = 'usr-student-fatu';
      } else if (simulatedRole === 'parent') {
        headers['x-user-id'] = 'usr-parent-abraham';
      } else if (simulatedRole === 'teacher') {
        headers['x-user-id'] = 'usr-teacher-tamba';
      } else {
        headers['x-user-id'] = 'usr-admin-marie';
      }

      const res = await fetch(endpoint, {
        method,
        headers,
        body: payload ? JSON.stringify(payload) : undefined,
      });

      const endTime = performance.now();
      setApiDuration(Math.round(endTime - startTime));
      setApiStatusCode(res.status);
      const data = await res.json();
      setApiResult(data);
    } catch (err: any) {
      const endTime = performance.now();
      setApiDuration(Math.round(endTime - startTime));
      setApiStatusCode(500);
      setApiResult({ error: err.message });
    } finally {
      setApiLoading(false);
    }
  };

  const copyToClipboard = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Server className="w-3.5 h-3.5" /> Full-Stack Express API Active
            </span>
            <span className="text-xs text-slate-400">Port 3000 /api Routes</span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white">
            Backend Architecture & PostgreSQL Row-Level Security
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
            Live Express REST endpoints with tenant isolation, FERPA compliance filters, Mobile Money gateways, and Gemini 3.7 Flash AI generation.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveSubTab('api_runner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubTab === 'api_runner'
                ? 'bg-emerald-600 text-white shadow ring-1 ring-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Live API Runner
          </button>
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Access Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('ddl')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'ddl'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            DDL Migrations
          </button>
          <button
            onClick={() => setActiveSubTab('rls')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'rls'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            RLS Policies
          </button>
          <button
            onClick={() => setActiveSubTab('backend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'backend'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Backend Middleware
          </button>
        </div>
      </div>

      {/* SUB-TAB: Live API Endpoint Test Bench */}
      {activeSubTab === 'api_runner' && (
        <div className="space-y-6">
          {/* Persona Header Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  Simulated Request Identity Headers (<code className="text-emerald-400">x-user-role</code>, <code className="text-emerald-400">x-school-id</code>)
                </h3>
                <p className="text-xs text-slate-400">
                  Select caller persona to verify backend tenant partitioning and FERPA rule enforcement in real-time.
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {(['school_admin', 'teacher', 'student', 'parent', 'bursar', 'platform_admin'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSimulatedRole(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase transition ${
                      simulatedRole === r
                        ? 'bg-emerald-600 text-white shadow ring-1 ring-emerald-400'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Endpoint Trigger Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identity & School APIs</span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => runLiveApi('/api/health', 'GET')}
                  className="text-left text-xs p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center justify-between transition"
                >
                  <span><span className="text-emerald-400 font-mono font-bold">GET</span> /api/health</span>
                  <span className="text-[10px] text-slate-400">System Status</span>
                </button>
                <button
                  onClick={() => runLiveApi('/api/auth/me', 'GET')}
                  className="text-left text-xs p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center justify-between transition"
                >
                  <span><span className="text-emerald-400 font-mono font-bold">GET</span> /api/auth/me</span>
                  <span className="text-[10px] text-slate-400">Caller Identity</span>
                </button>
                <button
                  onClick={() => runLiveApi('/api/schools/sch-savina-monrovia', 'GET')}
                  className="text-left text-xs p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center justify-between transition"
                >
                  <span><span className="text-emerald-400 font-mono font-bold">GET</span> /api/schools/:id</span>
                  <span className="text-[10px] text-slate-400">Tenant Info</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic & Compliance APIs</span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => runLiveApi('/api/grades?classId=cls-grade10-math', 'GET')}
                  className="text-left text-xs p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center justify-between transition"
                >
                  <span><span className="text-emerald-400 font-mono font-bold">GET</span> /api/grades</span>
                  <span className="text-[10px] text-slate-400">FERPA Filtered</span>
                </button>
                <button
                  onClick={() => runLiveApi('/api/users/profiles/usr-student-fatu', 'GET')}
                  className="text-left text-xs p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center justify-between transition"
                >
                  <span><span className="text-emerald-400 font-mono font-bold">GET</span> /api/users/profiles/:id</span>
                  <span className="text-[10px] text-amber-400">FERPA Medical/PII</span>
                </button>
                <button
                  onClick={() => runLiveApi('/api/moe/compliance-report', 'GET')}
                  className="text-left text-xs p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center justify-between transition"
                >
                  <span><span className="text-emerald-400 font-mono font-bold">GET</span> /api/moe/compliance</span>
                  <span className="text-[10px] text-slate-400">Inspection Data</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Money & AI APIs</span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() =>
                    runLiveApi('/api/bursar/momo-checkout', 'POST', {
                      invoiceId: 'inv-korvah-term1',
                      phoneNumber: '+231 77 999 4433',
                      paymentMethod: 'mtn_momo',
                      amount: 55,
                      currency: 'USD',
                    })
                  }
                  className="text-left text-xs p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center justify-between transition"
                >
                  <span><span className="text-amber-400 font-mono font-bold">POST</span> /api/bursar/momo</span>
                  <span className="text-[10px] text-emerald-400">MTN/Orange MoMo</span>
                </button>
                <button
                  onClick={() =>
                    runLiveApi('/api/ai/lesson-plan', 'POST', {
                      topic: 'Solving Simultaneous Equations in Market Trading',
                      subject: 'Mathematics',
                      gradeLevel: 'Grade 10',
                      studentTier: 'senior_high',
                      context: 'Practical Liberian commerce applications with dual currency calculations',
                    })
                  }
                  className="text-left text-xs p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center justify-between transition"
                >
                  <span><span className="text-amber-400 font-mono font-bold">POST</span> /api/ai/lesson-plan</span>
                  <span className="text-[10px] text-indigo-300">Gemini 3.7 Flash</span>
                </button>
                <button
                  onClick={() => runLiveApi('/api/live/sessions', 'GET')}
                  className="text-left text-xs p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center justify-between transition"
                >
                  <span><span className="text-emerald-400 font-mono font-bold">GET</span> /api/live/sessions</span>
                  <span className="text-[10px] text-slate-400">Virtual Class</span>
                </button>
              </div>
            </div>
          </div>

          {/* Response Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white">
                  <span className="text-emerald-400">{apiMethod}</span> {apiEndpoint}
                </span>
                {apiStatusCode && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold font-mono ${
                      apiStatusCode < 300
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    HTTP {apiStatusCode}
                  </span>
                )}
                {apiDuration !== null && (
                  <span className="text-[11px] text-slate-400 font-mono">{apiDuration}ms</span>
                )}
              </div>

              {apiResult && (
                <button
                  onClick={() => copyToClipboard(JSON.stringify(apiResult, null, 2), 'response')}
                  className="text-xs text-indigo-300 hover:text-white flex items-center gap-1"
                >
                  {copiedSection === 'response' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  Copy JSON
                </button>
              )}
            </div>

            <div className="p-4 bg-slate-950">
              {apiLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Executing server transaction...</span>
                </div>
              ) : apiResult ? (
                <pre className="text-xs font-mono text-emerald-300 overflow-x-auto max-h-[400px] leading-relaxed">
                  {JSON.stringify(apiResult, null, 2)}
                </pre>
              ) : (
                <div className="py-10 text-center text-slate-500 text-xs">
                  Click any endpoint button above to dispatch a live HTTP request to the Express backend.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: RLS Security Matrix Simulator */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          {/* Persona selector for simulation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-400" />
                  Live Access Control & Visibility Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Select a role persona to preview how PostgreSQL Row-Level Security evaluates permissions on disk.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {(['super_admin', 'school_admin', 'teacher', 'student', 'parent'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSimulatedRole(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase transition ${
                      simulatedRole === r
                        ? 'bg-indigo-600 text-white shadow ring-1 ring-indigo-400'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                PostgreSQL Entity Permission Evaluation (Role: <span className="text-indigo-400">{simulatedRole}</span>)
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> FORCE ROW LEVEL SECURITY Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Table Entity</th>
                    <th className="p-3.5">Multi-Tenant Filter</th>
                    <th className="p-3.5">SELECT (Read)</th>
                    <th className="p-3.5">INSERT (Create)</th>
                    <th className="p-3.5">UPDATE (Edit)</th>
                    <th className="p-3.5">DELETE (Remove)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="hover:bg-slate-850 transition">
                    <td className="p-3.5 font-mono font-bold text-white">schools</td>
                    <td className="p-3.5 text-slate-300 font-mono">id = app_current_school_id()</td>
                    <td className="p-3.5"><span className="text-emerald-400 font-bold">✓ Own School</span></td>
                    <td className="p-3.5"><span className={simulatedRole === 'super_admin' ? "text-emerald-400 font-bold" : "text-rose-400"}>{simulatedRole === 'super_admin' ? "✓ Allowed" : "✗ Denied"}</span></td>
                    <td className="p-3.5"><span className={simulatedRole.includes('admin') ? "text-emerald-400 font-bold" : "text-rose-400"}>{simulatedRole.includes('admin') ? "✓ Allowed" : "✗ Denied"}</span></td>
                    <td className="p-3.5"><span className={simulatedRole === 'super_admin' ? "text-emerald-400 font-bold" : "text-rose-400"}>{simulatedRole === 'super_admin' ? "✓ Allowed" : "✗ Denied"}</span></td>
                  </tr>

                  <tr className="hover:bg-slate-850 transition">
                    <td className="p-3.5 font-mono font-bold text-white">users / profiles</td>
                    <td className="p-3.5 text-slate-300 font-mono">school_id = app_current_school_id()</td>
                    <td className="p-3.5">
                      {simulatedRole === 'super_admin' || simulatedRole === 'school_admin' ? (
                        <span className="text-emerald-400 font-bold">✓ All in School</span>
                      ) : simulatedRole === 'teacher' ? (
                        <span className="text-emerald-400 font-bold">✓ All in School</span>
                      ) : simulatedRole === 'student' ? (
                        <span className="text-amber-400 font-bold">✓ Own Record Only</span>
                      ) : (
                        <span className="text-indigo-300 font-bold">✓ Self + Linked Children</span>
                      )}
                    </td>
                    <td className="p-3.5"><span className={simulatedRole.includes('admin') ? "text-emerald-400 font-bold" : "text-rose-400"}>{simulatedRole.includes('admin') ? "✓ Allowed" : "✗ Denied"}</span></td>
                    <td className="p-3.5"><span className={simulatedRole.includes('admin') ? "text-emerald-400 font-bold" : "text-rose-400"}>{simulatedRole.includes('admin') ? "✓ Allowed" : "✗ Denied"}</span></td>
                    <td className="p-3.5"><span className={simulatedRole === 'super_admin' || simulatedRole === 'school_admin' ? "text-emerald-400 font-bold" : "text-rose-400"}>{simulatedRole.includes('admin') ? "✓ Allowed" : "✗ Denied"}</span></td>
                  </tr>

                  <tr className="hover:bg-slate-850 transition">
                    <td className="p-3.5 font-mono font-bold text-white">classes</td>
                    <td className="p-3.5 text-slate-300 font-mono">school_id = app_current_school_id()</td>
                    <td className="p-3.5"><span className="text-emerald-400 font-bold">✓ Visible</span></td>
                    <td className="p-3.5"><span className={simulatedRole.includes('admin') || simulatedRole === 'teacher' ? "text-emerald-400 font-bold" : "text-rose-400"}>{simulatedRole.includes('admin') || simulatedRole === 'teacher' ? "✓ Allowed" : "✗ Denied"}</span></td>
                    <td className="p-3.5"><span className={simulatedRole.includes('admin') || simulatedRole === 'teacher' ? "text-emerald-400 font-bold" : "text-rose-400"}>{simulatedRole.includes('admin') || simulatedRole === 'teacher' ? "✓ Allowed" : "✗ Denied"}</span></td>
                    <td className="p-3.5"><span className={simulatedRole.includes('admin') ? "text-emerald-400 font-bold" : "text-rose-400"}>{simulatedRole.includes('admin') ? "✓ Allowed" : "✗ Denied"}</span></td>
                  </tr>

                  <tr className="hover:bg-slate-850 transition">
                    <td className="p-3.5 font-mono font-bold text-white">grades</td>
                    <td className="p-3.5 text-slate-300 font-mono">enrollment → class → school_id</td>
                    <td className="p-3.5">
                      {simulatedRole.includes('admin') || simulatedRole === 'teacher' ? (
                        <span className="text-emerald-400 font-bold">✓ Full School Visibility</span>
                      ) : simulatedRole === 'student' ? (
                        <span className="text-amber-400 font-bold">✓ Own Grades Only</span>
                      ) : (
                        <span className="text-indigo-300 font-bold">✓ Linked Children Only</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {simulatedRole === 'teacher' ? (
                        <span className="text-emerald-400 font-bold">✓ Assigned Classes (teacher_id)</span>
                      ) : simulatedRole.includes('admin') ? (
                        <span className="text-emerald-400 font-bold">✓ Allowed</span>
                      ) : (
                        <span className="text-rose-400 font-bold">✗ Denied</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {simulatedRole === 'teacher' ? (
                        <span className="text-emerald-400 font-bold">✓ Assigned Classes (teacher_id)</span>
                      ) : simulatedRole.includes('admin') ? (
                        <span className="text-emerald-400 font-bold">✓ Allowed</span>
                      ) : (
                        <span className="text-rose-400 font-bold">✗ Denied</span>
                      )}
                    </td>
                    <td className="p-3.5"><span className={simulatedRole.includes('admin') ? "text-emerald-400 font-bold" : "text-rose-400"}>{simulatedRole.includes('admin') ? "✓ Allowed" : "✗ Denied"}</span></td>
                  </tr>

                  <tr className="hover:bg-slate-850 transition">
                    <td className="p-3.5 font-mono font-bold text-white">attendance</td>
                    <td className="p-3.5 text-slate-300 font-mono">class → school_id</td>
                    <td className="p-3.5">
                      {simulatedRole.includes('admin') || simulatedRole === 'teacher' ? (
                        <span className="text-emerald-400 font-bold">✓ Full School Visibility</span>
                      ) : simulatedRole === 'student' ? (
                        <span className="text-amber-400 font-bold">✓ Own Attendance Only</span>
                      ) : (
                        <span className="text-indigo-300 font-bold">✓ Linked Children Only</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {simulatedRole === 'teacher' ? (
                        <span className="text-emerald-400 font-bold">✓ Assigned Classes (teacher_id)</span>
                      ) : simulatedRole.includes('admin') ? (
                        <span className="text-emerald-400 font-bold">✓ Allowed</span>
                      ) : (
                        <span className="text-rose-400 font-bold">✗ Denied</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {simulatedRole === 'teacher' ? (
                        <span className="text-emerald-400 font-bold">✓ Assigned Classes (teacher_id)</span>
                      ) : simulatedRole.includes('admin') ? (
                        <span className="text-emerald-400 font-bold">✓ Allowed</span>
                      ) : (
                        <span className="text-rose-400 font-bold">✗ Denied</span>
                      )}
                    </td>
                    <td className="p-3.5"><span className={simulatedRole.includes('admin') ? "text-emerald-400 font-bold" : "text-rose-400"}>{simulatedRole.includes('admin') ? "✓ Allowed" : "✗ Denied"}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DDL Migration Code */}
      {activeSubTab === 'ddl' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                DDL Migration 001_create_k12_schema.sql
              </h3>
              <p className="text-xs text-slate-400">
                PostgreSQL table definitions, constraints, composite indexes, and automated updated_at triggers.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(DDL_SQL, 'ddl')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition"
            >
              {copiedSection === 'ddl' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy DDL Migration SQL
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed">
            {DDL_SQL}
          </pre>
        </div>
      )}

      {/* SUB-TAB 3: RLS Security Policies */}
      {activeSubTab === 'rls' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                RLS Policies 002_enable_row_level_security.sql
              </h3>
              <p className="text-xs text-slate-400">
                Helper functions, FORCE RLS, and granular policies for tenant, role, and student isolation.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(RLS_SQL, 'rls')}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition"
            >
              {copiedSection === 'rls' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy RLS Policies SQL
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-indigo-200 overflow-x-auto max-h-[500px] leading-relaxed">
            {RLS_SQL}
          </pre>
        </div>
      )}

      {/* SUB-TAB 4: Backend Integration Middleware */}
      {activeSubTab === 'backend' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                Backend Session Middleware & Context Injector (TypeScript)
              </h3>
              <p className="text-xs text-slate-400">
                Transaction-scoped `SET LOCAL` injection ensuring pooled DB connections never leak tenant or user credentials.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(BACKEND_TS_CODE, 'backend')}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition"
            >
              {copiedSection === 'backend' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy TypeScript Middleware
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[500px] leading-relaxed">
            {BACKEND_TS_CODE}
          </pre>
        </div>
      )}
    </div>
  );
};
