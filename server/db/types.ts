import { UserRole, StudentTier, Currency } from '../../src/types';

export interface DbSchool {
  id: string;
  name: string;
  code: string;
  county: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  motto: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface DbUser {
  id: string;
  schoolId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: UserRole;
  phone: string;
  isActive: boolean;
  avatarUrl?: string;
  gradeLevel?: string;
  studentTier?: StudentTier;
  section?: string;
  teachingSubjects?: string[];
  assignedClassIds?: string[];
  points?: number;
  streakDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbProfile {
  id: string;
  userId: string;
  dateOfBirth?: string;
  gender?: string;
  gradeLevel?: string;
  nationalIdNumber?: string;
  primaryContactPhone?: string;
  residentialAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbParentStudentMap {
  id: string;
  schoolId: string;
  parentId: string;
  studentId: string;
  relationshipType: string;
  isAuthorizedPickup: boolean;
  isEmergencyContact: boolean;
  createdAt: string;
}

export interface DbClass {
  id: string;
  schoolId: string;
  name: string;
  gradeLevel: string;
  tier: StudentTier;
  subject: string;
  teacherId: string;
  teacherName: string;
  academicYear: string;
  termPeriod: string;
  roomNumber: string;
  maxCapacity: number;
  studentCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbEnrollment {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  enrollmentDate: string;
  status: 'active' | 'dropped' | 'completed';
  createdAt: string;
}

export interface DbGrade {
  id: string;
  enrollmentId: string;
  classId: string;
  studentId: string;
  studentName: string;
  subject: string;
  assignmentName: string;
  category: 'quiz' | 'continuous_assessment' | 'midterm' | 'final_exam';
  scoreAchieved: number;
  maxScore: number;
  percentage: number;
  letterGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  gradedBy: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbAttendance {
  id: string;
  schoolId: string;
  classId: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  period: string;
  markedBy: string;
  notes?: string;
  smsSentToParent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbFeeInvoice {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  termId: string;
  invoiceNumber: string;
  dueDate: string;
  items: { description: string; amountUSD: number; amountLRD: number }[];
  totalUSD: number;
  totalLRD: number;
  paidUSD: number;
  paidLRD: number;
  balanceUSD: number;
  balanceLRD: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  createdAt: string;
}

export interface DbPaymentTransaction {
  id: string;
  invoiceId: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  amountUSD: number;
  amountLRD: number;
  currencyPaid: Currency;
  paymentMethod: 'mtn_momo' | 'orange_money' | 'cash' | 'bank_transfer';
  referenceNumber: string;
  phoneNumber?: string;
  status: 'completed' | 'pending' | 'failed';
  receiptNumber: string;
  collectedBy: string;
  date: string;
  createdAt: string;
}

export interface DbMoECurriculum {
  id: string;
  gradeLevel: string;
  subject: string;
  code: string;
  title: string;
  term: string;
  competencies: string[];
  learningOutcomes: string[];
  recommendedHours: number;
  wassceDomain?: string;
  status: 'approved' | 'provisional';
}

export interface DbLiveSession {
  id: string;
  schoolId: string;
  classId: string;
  title: string;
  subject: string;
  gradeLevel: string;
  teacherId: string;
  teacherName: string;
  status: 'live' | 'scheduled' | 'ended';
  scheduledTime: string;
  currentAttendees: number;
  bandwidthMode: 'adaptive_video' | 'audio_slides_only';
  activeSlideIndex: number;
  audioBroadcastActive: boolean;
  slides: { title: string; content: string; points: string[] }[];
  createdAt: string;
}
