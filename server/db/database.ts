import {
  DbSchool,
  DbUser,
  DbProfile,
  DbParentStudentMap,
  DbClass,
  DbEnrollment,
  DbGrade,
  DbAttendance,
  DbFeeInvoice,
  DbPaymentTransaction,
  DbMoECurriculum,
  DbLiveSession,
} from './types';
import { UserRole } from '../../src/types';

export interface AuthContext {
  userId?: string;
  schoolId?: string;
  role?: UserRole;
  email?: string;
}

class K12Database {
  schools: DbSchool[] = [];
  users: DbUser[] = [];
  profiles: DbProfile[] = [];
  parentStudentMaps: DbParentStudentMap[] = [];
  classes: DbClass[] = [];
  enrollments: DbEnrollment[] = [];
  grades: DbGrade[] = [];
  attendance: DbAttendance[] = [];
  invoices: DbFeeInvoice[] = [];
  payments: DbPaymentTransaction[] = [];
  curriculum: DbMoECurriculum[] = [];
  liveSessions: DbLiveSession[] = [];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    // 1. Schools
    this.schools = [
      {
        id: 'sch-savina-monrovia',
        name: 'Savina Learning Center & High School',
        code: 'SLC-001',
        county: 'Montserrado',
        city: 'Monrovia',
        address: 'Tubman Boulevard, Sinkor',
        phone: '+231 77 012 3456',
        email: 'admin@savina.edu.lr',
        motto: 'Excellence in Knowledge & Character',
        themeColor: '#4f46e5',
        principalName: 'Dr. Marie Coleman-Togba',
        establishedYear: 2014,
        moeRegistrationNumber: 'MOE-LR-2014-0892',
        subscriptionPlan: 'enterprise',
        studentCount: 420,
        staffCount: 38,
        supportedCurriculum: ['Liberia MoE Standard', 'WASSCE Senior High Track', 'Early Years Phonics Plus'],
        momoMerchantIdMTN: 'MOMO-770-SLC-889',
        orangeMoneyMerchantId: 'OM-088-SLC-441',
        activeTermId: 'term-2025-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'sch-harbel-academy',
        name: 'Harbel Community Model Academy',
        code: 'HCMA-002',
        county: 'Margibi',
        city: 'Harbel',
        address: 'Firestone Camp 3 Road',
        phone: '+231 88 655 4321',
        email: 'info@harbelacademy.edu.lr',
        motto: 'Building Leaders for Tomorrow',
        themeColor: '#059669',
        principalName: 'Mr. Emmanuel J. Flomo',
        establishedYear: 2018,
        moeRegistrationNumber: 'MOE-LR-2018-1104',
        subscriptionPlan: 'standard',
        studentCount: 280,
        staffCount: 24,
        supportedCurriculum: ['Liberia MoE Standard', 'STEM Junior Academy'],
        momoMerchantIdMTN: 'MOMO-770-HCA-112',
        orangeMoneyMerchantId: 'OM-088-HCA-993',
        activeTermId: 'term-2025-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ];

    // 2. Users
    this.users = [
      {
        id: 'usr-admin-marie',
        schoolId: 'sch-savina-monrovia',
        email: 'admin@savina.edu.lr',
        firstName: 'Marie',
        lastName: 'Coleman-Togba',
        name: 'Dr. Marie Coleman-Togba',
        role: 'school_admin',
        phone: '+231 77 012 3456',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'usr-teacher-tamba',
        schoolId: 'sch-savina-monrovia',
        email: 'tamba.kollie@savina.edu.lr',
        firstName: 'Tamba',
        lastName: 'Kollie',
        name: 'Mr. Tamba Kollie',
        role: 'teacher',
        phone: '+231 77 555 1234',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        teachingSubjects: ['Mathematics', 'General Science', 'Integrated Physics'],
        assignedClassIds: ['cls-grade10-math', 'cls-grade4-math', 'cls-grade11-phys'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'usr-teacher-sarah',
        schoolId: 'sch-savina-monrovia',
        email: 'sarah.k@savina.edu.lr',
        firstName: 'Sarah',
        lastName: 'Kpadeh',
        name: 'Mrs. Sarah Kpadeh',
        role: 'teacher',
        phone: '+231 88 444 8877',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        teachingSubjects: ['Early Reading & Phonics', 'Numeracy Fun', 'Storytelling'],
        assignedClassIds: ['cls-k2-sunshine'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'usr-bursar-john',
        schoolId: 'sch-savina-monrovia',
        email: 'bursar@savina.edu.lr',
        firstName: 'John',
        lastName: 'Mulbah',
        name: 'Mr. John Mulbah',
        role: 'bursar',
        phone: '+231 77 888 3322',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'usr-student-fatu',
        schoolId: 'sch-savina-monrovia',
        email: 'fatu.sherif@student.savina.edu.lr',
        firstName: 'Fatu',
        lastName: 'Sherif',
        name: 'Fatu Sherif',
        role: 'student',
        phone: '+231 77 111 2233',
        isActive: true,
        gradeLevel: 'Grade 10',
        studentTier: 'senior_high',
        section: 'Stream A (Science Track)',
        points: 480,
        streakDays: 14,
        avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'usr-student-korvah',
        schoolId: 'sch-savina-monrovia',
        email: 'korvah.kamara@student.savina.edu.lr',
        firstName: 'Korvah',
        lastName: 'Kamara',
        name: 'Korvah Kamara',
        role: 'student',
        phone: '+231 88 999 1122',
        isActive: true,
        gradeLevel: 'K2',
        studentTier: 'k3_early',
        section: 'Sunshine Explorers',
        points: 290,
        streakDays: 8,
        avatarUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'usr-parent-abraham',
        schoolId: 'sch-savina-monrovia',
        email: 'abraham.sherif@gmail.com',
        firstName: 'Abraham',
        lastName: 'Sherif',
        name: 'Mr. Abraham Sherif',
        role: 'parent',
        phone: '+231 77 900 1122',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'usr-parent-kebbeh',
        schoolId: 'sch-savina-monrovia',
        email: 'kebbeh.kamara@yahoo.com',
        firstName: 'Kebbeh',
        lastName: 'Kamara',
        name: 'Madam Kebbeh Kamara',
        role: 'parent',
        phone: '+231 88 777 5544',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ];

    // 3. Profiles (Sensitive FERPA/PII data)
    this.profiles = [
      {
        id: 'prof-fatu-sherif',
        userId: 'usr-student-fatu',
        dateOfBirth: '2009-04-12',
        gender: 'Female',
        gradeLevel: 'Grade 10',
        nationalIdNumber: 'NID-LR-0994821',
        primaryContactPhone: '+231 77 900 1122',
        residentialAddress: 'Old Road, Sinkor, Monrovia',
        emergencyContactName: 'Abraham Sherif (Father)',
        emergencyContactPhone: '+231 77 900 1122',
        medicalNotes: 'Mild asthma inhaler kept in homeroom; no known drug allergies.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'prof-korvah-kamara',
        userId: 'usr-student-korvah',
        dateOfBirth: '2020-08-25',
        gender: 'Male',
        gradeLevel: 'K2',
        nationalIdNumber: 'NID-LR-1827364',
        primaryContactPhone: '+231 88 777 5544',
        residentialAddress: 'Airfield Shortcut, Sinkor',
        emergencyContactName: 'Kebbeh Kamara (Mother)',
        emergencyContactPhone: '+231 88 777 5544',
        medicalNotes: 'Peanut sensitivity; fully immunized under MoE national schedule.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ];

    // 4. Parent Student Map (FERPA Verification)
    this.parentStudentMaps = [
      {
        id: 'psm-1',
        schoolId: 'sch-savina-monrovia',
        parentId: 'usr-parent-abraham',
        studentId: 'usr-student-fatu',
        relationshipType: 'father',
        isAuthorizedPickup: true,
        isEmergencyContact: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'psm-2',
        schoolId: 'sch-savina-monrovia',
        parentId: 'usr-parent-kebbeh',
        studentId: 'usr-student-korvah',
        relationshipType: 'mother',
        isAuthorizedPickup: true,
        isEmergencyContact: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    // 5. Classes
    this.classes = [
      {
        id: 'cls-grade10-math',
        schoolId: 'sch-savina-monrovia',
        name: 'Grade 10 - Advanced Core Mathematics & Algebra',
        gradeLevel: 'Grade 10',
        tier: 'senior_high',
        subject: 'Mathematics',
        teacherId: 'usr-teacher-tamba',
        teacherName: 'Mr. Tamba Kollie',
        academicYear: '2025/2026',
        termPeriod: 'Semester 1',
        roomNumber: 'Science Wing Rm 204',
        maxCapacity: 40,
        studentCount: 36,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'cls-grade10-eng',
        schoolId: 'sch-savina-monrovia',
        name: 'Grade 10 - English Language & Literature (WASSCE Prep)',
        gradeLevel: 'Grade 10',
        tier: 'senior_high',
        subject: 'English Language',
        teacherId: 'usr-teacher-tamba',
        teacherName: 'Mr. Tamba Kollie',
        academicYear: '2025/2026',
        termPeriod: 'Semester 1',
        roomNumber: 'Main Building Rm 102',
        maxCapacity: 40,
        studentCount: 36,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'cls-k2-sunshine',
        schoolId: 'sch-savina-monrovia',
        name: 'K2 Sunshine Explorers - Early Phonics & Numeracy',
        gradeLevel: 'K2',
        tier: 'k3_early',
        subject: 'Early Childhood Foundations',
        teacherId: 'usr-teacher-sarah',
        teacherName: 'Mrs. Sarah Kpadeh',
        academicYear: '2025/2026',
        termPeriod: 'Semester 1',
        roomNumber: 'Early Learning Pavilion Rm 1',
        maxCapacity: 25,
        studentCount: 22,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ];

    // 6. Enrollments
    this.enrollments = [
      {
        id: 'enr-fatu-math',
        classId: 'cls-grade10-math',
        studentId: 'usr-student-fatu',
        studentName: 'Fatu Sherif',
        enrollmentDate: '2024-09-01',
        status: 'active',
        createdAt: '2024-09-01T00:00:00Z',
      },
      {
        id: 'enr-fatu-eng',
        classId: 'cls-grade10-eng',
        studentId: 'usr-student-fatu',
        studentName: 'Fatu Sherif',
        enrollmentDate: '2024-09-01',
        status: 'active',
        createdAt: '2024-09-01T00:00:00Z',
      },
      {
        id: 'enr-korvah-k2',
        classId: 'cls-k2-sunshine',
        studentId: 'usr-student-korvah',
        studentName: 'Korvah Kamara',
        enrollmentDate: '2024-09-01',
        status: 'active',
        createdAt: '2024-09-01T00:00:00Z',
      },
    ];

    // 7. Grades
    this.grades = [
      {
        id: 'grd-01',
        enrollmentId: 'enr-fatu-math',
        classId: 'cls-grade10-math',
        studentId: 'usr-student-fatu',
        studentName: 'Fatu Sherif',
        subject: 'Mathematics',
        assignmentName: 'Continuous Assessment 1: Quadratic Equations',
        category: 'continuous_assessment',
        scoreAchieved: 38,
        maxScore: 40,
        percentage: 95.0,
        letterGrade: 'A',
        gradedBy: 'usr-teacher-tamba',
        feedback: 'Exceptional algebraic factorisation and step-by-step proofs.',
        createdAt: '2025-01-15T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z',
      },
      {
        id: 'grd-02',
        enrollmentId: 'enr-fatu-math',
        classId: 'cls-grade10-math',
        studentId: 'usr-student-fatu',
        studentName: 'Fatu Sherif',
        subject: 'Mathematics',
        assignmentName: 'Midterm Examination (WASSCE Standard)',
        category: 'midterm',
        scoreAchieved: 54,
        maxScore: 60,
        percentage: 90.0,
        letterGrade: 'A',
        gradedBy: 'usr-teacher-tamba',
        feedback: 'Very strong geometric problem-solving. Maintain this pace for national finals.',
        createdAt: '2025-02-10T00:00:00Z',
        updatedAt: '2025-02-10T00:00:00Z',
      },
      {
        id: 'grd-03',
        enrollmentId: 'enr-korvah-k2',
        classId: 'cls-k2-sunshine',
        studentId: 'usr-student-korvah',
        studentName: 'Korvah Kamara',
        subject: 'Early Childhood Foundations',
        assignmentName: 'Phonics Letter Sounds & Blending Check',
        category: 'continuous_assessment',
        scoreAchieved: 19,
        maxScore: 20,
        percentage: 95.0,
        letterGrade: 'A',
        gradedBy: 'usr-teacher-sarah',
        feedback: 'Mastered sounds /s/, /a/, /t/, /p/ and read 5 CVC sight words!',
        createdAt: '2025-01-20T00:00:00Z',
        updatedAt: '2025-01-20T00:00:00Z',
      },
    ];

    // 8. Attendance Records
    this.attendance = [
      {
        id: 'att-01',
        schoolId: 'sch-savina-monrovia',
        classId: 'cls-grade10-math',
        studentId: 'usr-student-fatu',
        studentName: 'Fatu Sherif',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        period: 'Full Day',
        markedBy: 'usr-teacher-tamba',
        notes: 'Punctual, active class participation.',
        smsSentToParent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'att-02',
        schoolId: 'sch-savina-monrovia',
        classId: 'cls-k2-sunshine',
        studentId: 'usr-student-korvah',
        studentName: 'Korvah Kamara',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        period: 'Full Day',
        markedBy: 'usr-teacher-sarah',
        notes: 'Enthusiastic in morning circle time.',
        smsSentToParent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 9. Fee Invoices & Payments
    this.invoices = [
      {
        id: 'inv-fatu-term1',
        schoolId: 'sch-savina-monrovia',
        studentId: 'usr-student-fatu',
        studentName: 'Fatu Sherif',
        parentName: 'Mr. Abraham Sherif',
        parentPhone: '+231 77 900 1122',
        termId: 'term-2025-1',
        invoiceNumber: 'INV-2025-0012',
        dueDate: '2025-03-31',
        items: [
          { description: 'Tuition & Academic Instructional Fee (Grade 10)', amountUSD: 120, amountLRD: 22800 },
          { description: 'Science Lab & Computer Practical Materials', amountUSD: 25, amountLRD: 4750 },
          { description: 'Liberia MoE Examination & Assessment Levy', amountUSD: 15, amountLRD: 2850 },
        ],
        totalUSD: 160,
        totalLRD: 30400,
        paidUSD: 160,
        paidLRD: 30400,
        balanceUSD: 0,
        balanceLRD: 0,
        status: 'paid',
        createdAt: '2025-01-05T00:00:00Z',
      },
      {
        id: 'inv-korvah-term1',
        schoolId: 'sch-savina-monrovia',
        studentId: 'usr-student-korvah',
        studentName: 'Korvah Kamara',
        parentName: 'Madam Kebbeh Kamara',
        parentPhone: '+231 88 777 5544',
        termId: 'term-2025-1',
        invoiceNumber: 'INV-2025-0044',
        dueDate: '2025-03-31',
        items: [
          { description: 'Early Childhood K2 Learning Materials & Art Activity Kits', amountUSD: 85, amountLRD: 16150 },
          { description: 'Daily Nutritious Mid-Morning Snack Program', amountUSD: 30, amountLRD: 5700 },
        ],
        totalUSD: 115,
        totalLRD: 21850,
        paidUSD: 60,
        paidLRD: 11400,
        balanceUSD: 55,
        balanceLRD: 10450,
        status: 'partial',
        createdAt: '2025-01-05T00:00:00Z',
      },
    ];

    this.payments = [
      {
        id: 'pay-001',
        invoiceId: 'inv-fatu-term1',
        schoolId: 'sch-savina-monrovia',
        studentId: 'usr-student-fatu',
        studentName: 'Fatu Sherif',
        amountUSD: 160,
        amountLRD: 30400,
        currencyPaid: 'USD',
        paymentMethod: 'mtn_momo',
        referenceNumber: 'MTN-LR-892716301',
        phoneNumber: '+231 77 900 1122',
        status: 'completed',
        receiptNumber: 'REC-2025-0019',
        collectedBy: 'MTN Mobile Money Gateway',
        date: '2025-01-10T14:30:00Z',
        createdAt: '2025-01-10T14:30:00Z',
      },
      {
        id: 'pay-002',
        invoiceId: 'inv-korvah-term1',
        schoolId: 'sch-savina-monrovia',
        studentId: 'usr-student-korvah',
        studentName: 'Korvah Kamara',
        amountUSD: 60,
        amountLRD: 11400,
        currencyPaid: 'LRD',
        paymentMethod: 'orange_money',
        referenceNumber: 'OM-LR-55829104',
        phoneNumber: '+231 88 777 5544',
        status: 'completed',
        receiptNumber: 'REC-2025-0062',
        collectedBy: 'Orange Money Gateway',
        date: '2025-01-12T09:15:00Z',
        createdAt: '2025-01-12T09:15:00Z',
      },
    ];

    // 10. Ministry of Education (MoE) Curriculum
    this.curriculum = [
      {
        id: 'moe-g10-math-01',
        gradeLevel: 'Grade 10',
        subject: 'Mathematics',
        code: 'MOE-MTH-G10-U1',
        title: 'Real Number Systems, Algebraic Expressions & Polynomials',
        term: 'Term 1',
        competencies: [
          'Master linear & quadratic polynomial factorization',
          'Solve systems of simultaneous equations using graphical & algebraic methods',
          'Apply algebraic models to real-world Liberian economic & trade word problems',
        ],
        learningOutcomes: [
          'Students compute roots of quadratic equations with 90%+ accuracy',
          'Explain discriminant significance in discriminant test',
        ],
        recommendedHours: 24,
        wassceDomain: 'Algebra and Number Systems (35% exam weight)',
        status: 'approved',
      },
      {
        id: 'moe-g10-eng-01',
        gradeLevel: 'Grade 10',
        subject: 'English Language',
        code: 'MOE-ENG-G10-U1',
        title: 'Expository Essay Writing & West African Prose Appreciation',
        term: 'Term 1',
        competencies: [
          'Develop thesis statements and multi-paragraph expository essays',
          'Analyze themes of post-colonial history and resilience in West African prose',
        ],
        learningOutcomes: [
          'Produce a 500-word structured expository article with cohesive transitions',
        ],
        recommendedHours: 20,
        wassceDomain: 'Continuous Writing & Comprehension (40% exam weight)',
        status: 'approved',
      },
      {
        id: 'moe-k2-pho-01',
        gradeLevel: 'K2',
        subject: 'Early Childhood Foundations',
        code: 'MOE-ECE-K2-U1',
        title: 'Phonics Foundations: Auditory Discrimination & Letter Shapes',
        term: 'Term 1',
        competencies: [
          'Recognize letters A through Z by sound and uppercase/lowercase shapes',
          'Blend consonant-vowel-consonant (CVC) sounds into spoken words',
        ],
        learningOutcomes: [
          'Identify initial consonant sounds in pictured objects with physical gestures',
        ],
        recommendedHours: 30,
        status: 'approved',
      },
    ];

    // 11. Live Virtual Classroom Sessions
    this.liveSessions = [
      {
        id: 'live-sess-math-10',
        schoolId: 'sch-savina-monrovia',
        classId: 'cls-grade10-math',
        title: 'Interactive Seminar: Mastering Simultaneous Linear Equations',
        subject: 'Mathematics',
        gradeLevel: 'Grade 10',
        teacherId: 'usr-teacher-tamba',
        teacherName: 'Mr. Tamba Kollie',
        status: 'live',
        scheduledTime: '2025-01-20T10:00:00Z',
        currentAttendees: 28,
        bandwidthMode: 'audio_slides_only',
        activeSlideIndex: 2,
        audioBroadcastActive: true,
        slides: [
          {
            title: '1. Welcome & Learning Goals',
            content: 'Reviewing elimination vs. substitution methods for WASSCE Grade 10.',
            points: ['Step 1: Align coefficients', 'Step 2: Add or subtract equations', 'Step 3: Solve for variable 1'],
          },
          {
            title: '2. Worked Example: Market Trading Matrix',
            content: 'Calculate cost per bag of rice and palm oil using dual linear constraints.',
            points: ['2x + 3y = $45', '4x + y = $40', 'Find value of x and y'],
          },
          {
            title: '3. Step-by-Step Solution & Board Notes',
            content: 'Multiply equation (2) by 3 to eliminate y: 12x + 3y = $120. Subtract: 10x = $75 -> x = $7.50.',
            points: ['Price of Rice = $7.50 / bag', 'Price of Palm Oil = $10.00 / gallon', 'Verified!'],
          },
        ],
        createdAt: '2025-01-20T09:00:00Z',
      },
    ];
  }

  // RLS Filter helper for queries
  filterByTenant<T extends { schoolId?: string }>(items: T[], ctx: AuthContext): T[] {
    if (ctx.role === 'platform_admin' || (ctx.role as any) === 'super_admin') {
      return items;
    }
    if (!ctx.schoolId) {
      return items;
    }
    return items.filter((item) => !item.schoolId || item.schoolId === ctx.schoolId);
  }
}

export const db = new K12Database();
