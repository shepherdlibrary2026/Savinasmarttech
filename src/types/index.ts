export type UserRole =
  | 'platform_admin'
  | 'school_admin'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'bursar';

export type StudentTier = 'k3_early' | 'upper_primary' | 'junior_high' | 'senior_high';

export type Currency = 'USD' | 'LRD';

export type ConnectionMode = 'online_4g' | 'slow_3g' | 'offline';

export interface SchoolTenant {
  id: string;
  name: string;
  code: string;
  county: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  motto: string;
  logoUrl?: string;
  themeColor: string;
  principalName: string;
  establishedYear: number;
  moeRegistrationNumber: string;
  subscriptionPlan: 'community' | 'standard' | 'enterprise';
  studentCount: number;
  staffCount: number;
  supportedCurriculum: string[];
  momoMerchantIdMTN: string;
  orangeMoneyMerchantId: string;
  activeTermId: string;
  // Stripe SaaS Billing Gateway metadata
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePaymentStatus?: 'active' | 'trialing' | 'past_due' | 'unpaid' | 'canceled';
  currentBillingPeriodEnd?: string;
  billingInterval?: 'monthly' | 'annual';
  cardLast4?: string;
  cardBrand?: string;
}

export interface User {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  // Specific role metadata
  gradeLevel?: string; // e.g. "K2", "Grade 3", "Grade 10"
  studentTier?: StudentTier;
  section?: string;
  parentOfStudentIds?: string[];
  teachingSubjects?: string[];
  assignedClassIds?: string[];
  badges?: StudentBadge[];
  points?: number;
  streakDays?: number;
}

export interface StudentBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'attendance' | 'quiz' | 'reading' | 'homework';
  unlockedAt: string;
}

export interface AcademicTerm {
  id: string;
  schoolId: string;
  name: string; // e.g., "Term 1 (First Semester 2025/2026)"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'upcoming' | 'active' | 'completed';
}

export interface ClassGrade {
  id: string;
  schoolId: string;
  gradeLevel: string; // "Kindergarten 1", "Grade 4", "Grade 10 (Senior High)"
  tier: StudentTier;
  sectionName: string; // "Stream A - Hibiscus", "Science Section"
  roomNumber: string;
  classTeacherId: string;
  studentCount: number;
  maxCapacity: number;
  subjects: string[];
}

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  classId: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'excused';
  period?: string; // "Full Day" or "Period 1 - Mathematics"
  markedByTeacherId: string;
  notes?: string;
  smsSentToParent: boolean;
  isSynced: boolean;
}

export interface GradeItem {
  id: string;
  schoolId: string;
  classId: string;
  subject: string;
  title: string; // "Continuous Assessment 1", "Midterm Exam", "WASSCE Trial"
  termId: string;
  maxMarks: number;
  weightPercentage: number;
  date: string;
}

export interface StudentScore {
  id: string;
  gradeItemId: string;
  studentId: string;
  studentName: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  letterGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  remark: string;
  isSynced: boolean;
}

export interface ReportCard {
  id: string;
  studentId: string;
  studentName: string;
  gradeLevel: string;
  termId: string;
  termName: string;
  subjects: {
    name: string;
    caScore: number; // /40
    examScore: number; // /60
    totalScore: number; // /100
    letterGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    remark: string;
  }[];
  overallAverage: number;
  classPosition: number;
  totalStudentsInClass: number;
  conduct: string;
  attendanceDaysPresent: number;
  attendanceDaysTotal: number;
  principalRemark: string;
  teacherRemark: string;
  nextTermBegins: string;
  outstandingBalanceUSD: number;
}

export interface LessonMaterial {
  id: string;
  schoolId: string;
  title: string;
  subject: string;
  gradeLevel: string;
  tier: StudentTier;
  topic: string;
  moeCurriculumCode?: string;
  description: string;
  readAloudText?: string; // For K-3 read aloud
  audioNarrationUrl?: string; // Low bandwidth audio
  videoUrl?: string; // High bandwidth
  slides: {
    slideNumber: number;
    title: string;
    content: string;
    imageUrl?: string;
    bulletPoints?: string[];
  }[];
  attachments?: {
    name: string;
    sizeKb: number;
    type: 'pdf' | 'audio' | 'worksheet';
  }[];
  estimatedDataKb: number;
  videoDataMb?: number;
  isDownloadedOffline?: boolean;
}

export interface Assignment {
  id: string;
  schoolId: string;
  classId: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  questions?: {
    id: string;
    questionText: string;
    options?: string[];
    correctAnswerIndex?: number;
    explanation?: string;
    points: number;
    type: 'multiple_choice' | 'short_answer' | 'read_aloud_record';
  }[];
  tier: StudentTier;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  answers: {
    questionId: string;
    answer: string | number;
  }[];
  score?: number;
  totalPoints: number;
  teacherFeedback?: string;
  status: 'submitted' | 'graded' | 'late';
  isSynced: boolean;
}

export interface FeeInvoice {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  termId: string;
  invoiceNumber: string;
  dueDate: string;
  items: {
    description: string;
    amountUSD: number;
    amountLRD: number;
  }[];
  totalUSD: number;
  totalLRD: number;
  paidUSD: number;
  paidLRD: number;
  balanceUSD: number;
  balanceLRD: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
}

export interface PaymentTransaction {
  id: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  amountUSD: number;
  amountLRD: number;
  currencyPaid: Currency;
  paymentMethod: 'mtn_momo' | 'orange_money' | 'cash' | 'bank_transfer';
  referenceNumber: string;
  phoneNumber?: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  receiptNumber: string;
  collectedBy: string;
}

export interface ParentTeacherMessage {
  id: string;
  schoolId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  studentId?: string;
  studentName?: string;
  subject: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  smsSentFallback?: boolean;
}

export interface SMSGatewayLog {
  id: string;
  schoolId: string;
  recipientPhone: string;
  recipientName: string;
  category: 'attendance_absence' | 'fee_reminder' | 'emergency_broadcast' | 'grade_report' | 'payment_receipt';
  messageText: string;
  timestamp: string;
  network: 'Lonestar MTN' | 'Orange Liberia';
  status: 'delivered' | 'sent' | 'queued_offline';
}

export interface OfflineSyncItem {
  id: string;
  type: 'attendance' | 'grade' | 'assignment_submission' | 'payment_record' | 'sms_queue';
  title: string;
  timestamp: string;
  data: any;
  status: 'pending' | 'synced' | 'failed';
}

export interface LiveVirtualClass {
  id: string;
  schoolId: string;
  title: string;
  subject: string;
  gradeLevel: string;
  teacherName: string;
  status: 'live' | 'scheduled' | 'ended';
  scheduledTime: string;
  currentAttendees: number;
  bandwidthMode: 'adaptive_video' | 'audio_slides_only';
  activeSlideIndex: number;
  audioBroadcastActive: boolean;
  slides: {
    title: string;
    content: string;
    points: string[];
  }[];
}

export interface StripeSaaSPlan {
  id: 'community' | 'standard' | 'enterprise';
  name: string;
  priceMonthlyUSD: number;
  priceAnnualUSD: number;
  studentLimit: number;
  staffLimit: number;
  features: string[];
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
  popular?: boolean;
}

export interface StripeSaaSInvoice {
  id: string;
  schoolId: string;
  schoolName: string;
  stripeInvoiceId: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  amountUSD: number;
  planId: 'community' | 'standard' | 'enterprise';
  billingInterval: 'monthly' | 'annual';
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  invoicePdfUrl?: string;
  hostedInvoiceUrl?: string;
  createdAt: string;
  paidAt?: string;
  cardBrand?: string;
  cardLast4?: string;
  receiptNumber: string;
}

