import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { networkManager, NetworkState } from '../services/networkManager';
import {
  SchoolTenant,
  User,
  AcademicTerm,
  ClassGrade,
  AttendanceRecord,
  ReportCard,
  LessonMaterial,
  Assignment,
  AssignmentSubmission,
  FeeInvoice,
  PaymentTransaction,
  ParentTeacherMessage,
  SMSGatewayLog,
  OfflineSyncItem,
  LiveVirtualClass,
  Currency,
  ConnectionMode,
  UserRole,
  StripeSaaSPlan,
  StripeSaaSInvoice,
} from '../types';
import {
  INITIAL_SCHOOLS,
  INITIAL_USERS,
  INITIAL_TERMS,
  INITIAL_CLASSES,
  INITIAL_ATTENDANCE,
  INITIAL_LESSONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_REPORT_CARDS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_MESSAGES,
  INITIAL_SMS_LOGS,
  INITIAL_LIVE_CLASSES,
  STRIPE_SAAS_PLANS,
  INITIAL_STRIPE_INVOICES,
} from '../data/mockData';

const USD_TO_LRD_RATE = 198; // 1 USD = 198 LRD (Liberian Market Standard)

interface AppContextType {
  // Tenant & User
  schools: SchoolTenant[];
  currentSchool: SchoolTenant;
  setCurrentSchool: (school: SchoolTenant) => void;
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole, targetUserId?: string) => void;
  registerNewSchool: (newSchool: Omit<SchoolTenant, 'id'>) => void;

  // Connectivity & Low Bandwidth
  connectionMode: ConnectionMode;
  setConnectionMode: (mode: ConnectionMode) => void;
  dataSaverActive: boolean;
  setDataSaverActive: (active: boolean) => void;
  offlineQueue: OfflineSyncItem[];
  triggerSyncQueue: () => Promise<void>;
  dataBytesSavedKb: number;
  isPhysicalOffline: boolean;
  effectiveNetworkType: string;
  networkLatencyMs?: number;
  offlineDiagnosticsModalOpen: boolean;
  setOfflineDiagnosticsModalOpen: (open: boolean) => void;

  // Currency
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatMoney: (amountUSD: number, targetCurrency?: Currency) => string;
  usdToLrdRate: number;

  // Data Collections
  terms: AcademicTerm[];
  classes: ClassGrade[];
  attendance: AttendanceRecord[];
  markAttendance: (record: Omit<AttendanceRecord, 'id' | 'isSynced'>) => void;
  notifyAbsentParentsSMS: (classId: string, date: string) => number;

  lessons: LessonMaterial[];
  toggleDownloadLessonOffline: (lessonId: string) => void;
  addLesson: (lesson: Omit<LessonMaterial, 'id'>) => void;

  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  submissions: AssignmentSubmission[];
  submitAssignment: (sub: Omit<AssignmentSubmission, 'id' | 'isSynced' | 'submittedAt'>) => void;
  gradeSubmission: (submissionId: string, score: number, feedback: string) => void;

  reportCards: ReportCard[];
  updateReportCard: (card: ReportCard) => void;

  invoices: FeeInvoice[];
  payments: PaymentTransaction[];
  processPayment: (payment: Omit<PaymentTransaction, 'id' | 'receiptNumber' | 'date'>) => Promise<PaymentTransaction>;

  messages: ParentTeacherMessage[];
  sendMessage: (msg: Omit<ParentTeacherMessage, 'id' | 'timestamp' | 'isRead'>) => void;

  smsLogs: SMSGatewayLog[];
  sendSMSBroadcast: (recipientPhone: string, recipientName: string, category: SMSGatewayLog['category'], text: string) => void;

  liveClasses: LiveVirtualClass[];
  updateLiveClassSlide: (classId: string, slideIndex: number) => void;

  // Stripe SaaS Billing Gateway (Platform Admin & School Admin Subscription)
  stripePlans: StripeSaaSPlan[];
  stripeInvoices: StripeSaaSInvoice[];
  stripeModalOpen: boolean;
  setStripeModalOpen: (open: boolean) => void;
  targetSchoolForStripe?: SchoolTenant;
  setTargetSchoolForStripe: (school: SchoolTenant | undefined) => void;
  openStripeCheckout: (school: SchoolTenant, planId?: 'community' | 'standard' | 'enterprise') => void;
  processStripeSubscription: (
    schoolId: string,
    planId: 'community' | 'standard' | 'enterprise',
    billingInterval: 'monthly' | 'annual',
    paymentDetails: {
      cardNumber: string;
      cardholderName: string;
      expiry: string;
      cvc: string;
      postalCode?: string;
    }
  ) => Promise<{ success: boolean; invoice: StripeSaaSInvoice; updatedSchool: SchoolTenant }>;
  cancelStripeSubscription: (schoolId: string) => Promise<void>;

  // Modals & UI helpers
  isLandingView: boolean;
  setIsLandingView: (view: boolean) => void;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  signUpModalOpen: boolean;
  setSignUpModalOpen: (open: boolean) => void;
  signUpInitialMode: 'school' | 'member';
  setSignUpInitialMode: (mode: 'school' | 'member') => void;
  activeRoleModalOpen: boolean;
  setActiveRoleModalOpen: (open: boolean) => void;
  smsGatewayModalOpen: boolean;
  setSmsGatewayModalOpen: (open: boolean) => void;
  aiSuiteModalOpen: boolean;
  setAiSuiteModalOpen: (open: boolean) => void;
  aiSuiteTab: 'search' | 'chat' | 'voice' | 'music' | 'image' | 'video' | 'transcribe';
  setAiSuiteTab: (tab: 'search' | 'chat' | 'voice' | 'music' | 'image' | 'video' | 'transcribe') => void;
  openAiSuite: (tab?: 'search' | 'chat' | 'voice' | 'music' | 'image' | 'video' | 'transcribe') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistent or default state
  const [schools, setSchools] = useState<SchoolTenant[]>(() => {
    const saved = localStorage.getItem('savina_schools');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
  });

  const [currentSchool, setCurrentSchool] = useState<SchoolTenant>(() => {
    const saved = localStorage.getItem('savina_current_school');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS[0];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('savina_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('savina_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[1]; // Default to School Admin
  });

  // Connectivity
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('online_4g');
  const [dataSaverActive, setDataSaverActive] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncItem[]>(() => {
    const saved = localStorage.getItem('savina_offline_queue');
    return saved ? JSON.parse(saved) : [];
  });
  const [dataBytesSavedKb, setDataBytesSavedKb] = useState<number>(14250); // Simulates ~14.2 MB saved

  // Real Network Status from NetworkManager
  const [isPhysicalOffline, setIsPhysicalOffline] = useState<boolean>(!networkManager.getState().isOnline);
  const [effectiveNetworkType, setEffectiveNetworkType] = useState<string>(networkManager.getState().effectiveType);
  const [networkLatencyMs, setNetworkLatencyMs] = useState<number | undefined>(networkManager.getState().latencyMs);
  const [offlineDiagnosticsModalOpen, setOfflineDiagnosticsModalOpen] = useState(false);

  // Sync offline queue to localStorage
  useEffect(() => {
    localStorage.setItem('savina_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Subscribe to NetworkManager
  useEffect(() => {
    const unsubscribe = networkManager.subscribe((state) => {
      const physicallyOffline = !state.isOnline;
      setIsPhysicalOffline(physicallyOffline);
      setEffectiveNetworkType(state.effectiveType);
      setNetworkLatencyMs(state.latencyMs);

      // If physically offline, auto switch connection mode to offline
      if (physicallyOffline) {
        setConnectionMode('offline');
      } else {
        // If coming back online and was on offline mode due to network loss, auto restore
        if (state.effectiveType === 'slow-2g' || state.effectiveType === '2g' || state.effectiveType === '3g') {
          setConnectionMode('slow_3g');
        } else {
          setConnectionMode('online_4g');
        }

        // Auto trigger background sync of queued offline mutations
        if (offlineQueue.length > 0) {
          triggerSyncQueue();
        }
      }
    });

    return () => unsubscribe();
  }, [offlineQueue.length]);

  // Currency
  const [currency, setCurrency] = useState<Currency>('USD');

  // School data items
  const [terms] = useState<AcademicTerm[]>(INITIAL_TERMS);
  const [classes, setClasses] = useState<ClassGrade[]>(INITIAL_CLASSES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('savina_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });
  const [lessons, setLessons] = useState<LessonMaterial[]>(() => {
    const saved = localStorage.getItem('savina_lessons');
    return saved ? JSON.parse(saved) : INITIAL_LESSONS;
  });
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => {
    const saved = localStorage.getItem('savina_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });
  const [reportCards, setReportCards] = useState<ReportCard[]>(INITIAL_REPORT_CARDS);
  const [invoices, setInvoices] = useState<FeeInvoice[]>(INITIAL_INVOICES);
  const [payments, setPayments] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [messages, setMessages] = useState<ParentTeacherMessage[]>(INITIAL_MESSAGES);
  const [smsLogs, setSmsLogs] = useState<SMSGatewayLog[]>(INITIAL_SMS_LOGS);
  const [liveClasses, setLiveClasses] = useState<LiveVirtualClass[]>(INITIAL_LIVE_CLASSES);

  // Stripe SaaS Billing State
  const [stripePlans] = useState<StripeSaaSPlan[]>(STRIPE_SAAS_PLANS);
  const [stripeInvoices, setStripeInvoices] = useState<StripeSaaSInvoice[]>(() => {
    const saved = localStorage.getItem('savina_stripe_invoices');
    return saved ? JSON.parse(saved) : INITIAL_STRIPE_INVOICES;
  });
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [targetSchoolForStripe, setTargetSchoolForStripe] = useState<SchoolTenant | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem('savina_stripe_invoices', JSON.stringify(stripeInvoices));
  }, [stripeInvoices]);

  const openStripeCheckout = (school: SchoolTenant, planId?: 'community' | 'standard' | 'enterprise') => {
    setTargetSchoolForStripe(school);
    setStripeModalOpen(true);
  };

  const processStripeSubscription = async (
    schoolId: string,
    planId: 'community' | 'standard' | 'enterprise',
    billingInterval: 'monthly' | 'annual',
    paymentDetails: {
      cardNumber: string;
      cardholderName: string;
      expiry: string;
      cvc: string;
      postalCode?: string;
    }
  ): Promise<{ success: boolean; invoice: StripeSaaSInvoice; updatedSchool: SchoolTenant }> => {
    // Simulate network API call to Stripe API backend
    await new Promise((resolve) => setTimeout(resolve, 1400));

    const selectedPlan = stripePlans.find((p) => p.id === planId) || stripePlans[1];
    const amountUSD = billingInterval === 'annual' ? selectedPlan.priceAnnualUSD : selectedPlan.priceMonthlyUSD;

    const rawLast4 = paymentDetails.cardNumber.replace(/\s+/g, '').slice(-4) || '4242';
    const cardBrand = paymentDetails.cardNumber.startsWith('4')
      ? 'visa'
      : paymentDetails.cardNumber.startsWith('5')
      ? 'mastercard'
      : paymentDetails.cardNumber.startsWith('3')
      ? 'amex'
      : 'visa';

    const periodEnd = new Date();
    if (billingInterval === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const nextDueDateStr = periodEnd.toISOString().split('T')[0];

    const targetSchool = schools.find((s) => s.id === schoolId) || currentSchool;

    const updatedSchool: SchoolTenant = {
      ...targetSchool,
      subscriptionPlan: planId,
      stripePaymentStatus: 'active',
      currentBillingPeriodEnd: nextDueDateStr,
      billingInterval,
      stripeCustomerId: targetSchool.stripeCustomerId || `cus_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      stripeSubscriptionId: `sub_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      cardBrand,
      cardLast4: rawLast4,
    };

    // Update in state
    setSchools((prev) => prev.map((s) => (s.id === schoolId ? updatedSchool : s)));
    if (currentSchool.id === schoolId) {
      setCurrentSchool(updatedSchool);
    }

    // Generate Stripe Invoice record
    const invoiceId = `sinv_${Date.now()}`;
    const newInvoice: StripeSaaSInvoice = {
      id: invoiceId,
      schoolId: updatedSchool.id,
      schoolName: updatedSchool.name,
      stripeInvoiceId: `in_1P${Date.now().toString(36).toUpperCase()}`,
      stripePaymentIntentId: `pi_3P${Date.now().toString(36).toUpperCase()}`,
      stripeChargeId: `ch_3P${Date.now().toString(36).toUpperCase()}`,
      amountUSD,
      planId,
      billingInterval,
      status: 'paid',
      createdAt: new Date().toISOString().split('T')[0],
      paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      cardBrand,
      cardLast4: rawLast4,
      receiptNumber: `REC-STRIPE-${Date.now().toString().slice(-6)}`,
    };

    setStripeInvoices((prev) => [newInvoice, ...prev]);

    return {
      success: true,
      invoice: newInvoice,
      updatedSchool,
    };
  };

  const cancelStripeSubscription = async (schoolId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSchools((prev) =>
      prev.map((s) =>
        s.id === schoolId
          ? {
              ...s,
              stripePaymentStatus: 'canceled',
            }
          : s
      )
    );
    if (currentSchool.id === schoolId) {
      setCurrentSchool((prev) => ({
        ...prev,
        stripePaymentStatus: 'canceled',
      }));
    }
  };


  // UI state
  const [isLandingView, setIsLandingView] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState<boolean>(false);
  const [signUpInitialMode, setSignUpInitialMode] = useState<'school' | 'member'>('school');
  const [activeRoleModalOpen, setActiveRoleModalOpen] = useState(false);
  const [smsGatewayModalOpen, setSmsGatewayModalOpen] = useState(false);
  const [aiSuiteModalOpen, setAiSuiteModalOpen] = useState(false);
  const [aiSuiteTab, setAiSuiteTab] = useState<'search' | 'chat' | 'voice' | 'music' | 'image' | 'video' | 'transcribe'>('search');

  const openAiSuite = (tab?: 'search' | 'chat' | 'voice' | 'music' | 'image' | 'video' | 'transcribe') => {
    if (tab) setAiSuiteTab(tab);
    setAiSuiteModalOpen(true);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('savina_schools', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem('savina_current_school', JSON.stringify(currentSchool));
  }, [currentSchool]);

  useEffect(() => {
    localStorage.setItem('savina_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('savina_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('savina_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('savina_lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('savina_submissions', JSON.stringify(submissions));
  }, [submissions]);

  // Currency helper
  const formatMoney = (amountUSD: number, targetCurrency: Currency = currency): string => {
    if (targetCurrency === 'USD') {
      return `$${amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
    } else {
      const lrd = Math.round(amountUSD * USD_TO_LRD_RATE);
      return `L$${lrd.toLocaleString()} LRD`;
    }
  };

  // Role Switcher helper
  const switchRole = (role: UserRole, targetUserId?: string) => {
    if (targetUserId) {
      const found = users.find((u) => u.id === targetUserId);
      if (found) {
        setCurrentUser(found);
        return;
      }
    }
    const matching = users.find((u) => u.role === role);
    if (matching) {
      setCurrentUser(matching);
    }
  };

  // Register new School tenant
  const registerNewSchool = (newSchoolData: Omit<SchoolTenant, 'id'>) => {
    const id = `school_${Date.now()}`;
    const newSchool: SchoolTenant = { ...newSchoolData, id };
    setSchools((prev) => [...prev, newSchool]);
    setCurrentSchool(newSchool);
  };

  // Mark Attendance (with offline support)
  const markAttendance = (record: Omit<AttendanceRecord, 'id' | 'isSynced'>) => {
    const isOnline = connectionMode !== 'offline';
    const newRecord: AttendanceRecord = {
      ...record,
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isSynced: isOnline,
    };

    setAttendance((prev) => {
      // Replace if same student and date already marked
      const filtered = prev.filter(
        (a) => !(a.studentId === record.studentId && a.date === record.date && a.period === record.period)
      );
      return [newRecord, ...filtered];
    });

    if (!isOnline) {
      setOfflineQueue((prev) => [
        ...prev,
        {
          id: `queue_${Date.now()}`,
          type: 'attendance',
          title: `Attendance: ${record.studentName} marked ${record.status.toUpperCase()}`,
          timestamp: new Date().toLocaleTimeString(),
          data: newRecord,
          status: 'pending',
        },
      ]);
    }
  };

  // 1-Click Notify Absent Parents SMS
  const notifyAbsentParentsSMS = (classId: string, date: string): number => {
    const absentRecords = attendance.filter(
      (a) => a.classId === classId && a.date === date && (a.status === 'absent' || a.status === 'late')
    );

    let count = 0;
    absentRecords.forEach((rec) => {
      const targetUser = users.find((u) => u.id === rec.studentId);
      const parentUser = users.find((u) => u.parentOfStudentIds?.includes(rec.studentId));
      const phone = parentUser?.phone || '+231 77 654 3210';
      const parentName = parentUser?.name || 'Parent/Guardian';

      const statusText = rec.status === 'absent' ? 'ABSENT from class' : 'marked LATE for class';
      const text = `${currentSchool.name.toUpperCase()} ALERT: Please note that ${rec.studentName} was ${statusText} on ${date}. If you have inquiries, reply or call the administration.`;

      sendSMSBroadcast(phone, parentName, 'attendance_absence', text);
      count++;
    });

    return count;
  };

  // Toggle offline lesson download
  const toggleDownloadLessonOffline = (lessonId: string) => {
    setLessons((prev) =>
      prev.map((l) => {
        if (l.id === lessonId) {
          const newStatus = !l.isDownloadedOffline;
          if (newStatus) {
            setDataBytesSavedKb((saved) => saved + (l.videoDataMb ? l.videoDataMb * 1024 : 15000));
          }
          return { ...l, isDownloadedOffline: newStatus };
        }
        return l;
      })
    );
  };

  const addLesson = (lesson: Omit<LessonMaterial, 'id'>) => {
    const newLesson: LessonMaterial = {
      ...lesson,
      id: `lesson_${Date.now()}`,
      isDownloadedOffline: false,
    };
    setLessons((prev) => [newLesson, ...prev]);
  };

  const addAssignment = (assignment: Omit<Assignment, 'id'>) => {
    const newAsg: Assignment = {
      ...assignment,
      id: `asg_${Date.now()}`,
    };
    setAssignments((prev) => [newAsg, ...prev]);
  };

  const submitAssignment = (sub: Omit<AssignmentSubmission, 'id' | 'isSynced' | 'submittedAt'>) => {
    const isOnline = connectionMode !== 'offline';
    const newSub: AssignmentSubmission = {
      ...sub,
      id: `sub_${Date.now()}`,
      submittedAt: new Date().toLocaleString(),
      isSynced: isOnline,
    };

    setSubmissions((prev) => [newSub, ...prev]);

    if (!isOnline) {
      setOfflineQueue((prev) => [
        ...prev,
        {
          id: `queue_${Date.now()}`,
          type: 'assignment_submission',
          title: `Assignment Submission: ${sub.studentName}`,
          timestamp: new Date().toLocaleTimeString(),
          data: newSub,
          status: 'pending',
        },
      ]);
    }
  };

  const gradeSubmission = (submissionId: string, score: number, feedback: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId ? { ...s, score, teacherFeedback: feedback, status: 'graded' } : s
      )
    );
  };

  const updateReportCard = (card: ReportCard) => {
    setReportCards((prev) => prev.map((c) => (c.id === card.id ? card : c)));
  };

  // Mobile Money & Payment Engine
  const processPayment = async (
    paymentData: Omit<PaymentTransaction, 'id' | 'receiptNumber' | 'date'>
  ): Promise<PaymentTransaction> => {
    const receiptNumber = `REC-${currentSchool.code || 'SAV'}-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newPayment: PaymentTransaction = {
      ...paymentData,
      id: `pay_${Date.now()}`,
      receiptNumber,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
    };

    // Update invoice balance
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === paymentData.invoiceId) {
          const newPaidUSD = inv.paidUSD + paymentData.amountUSD;
          const newPaidLRD = inv.paidLRD + paymentData.amountLRD;
          const newBalUSD = Math.max(0, inv.totalUSD - newPaidUSD);
          const newBalLRD = Math.max(0, inv.totalLRD - newPaidLRD);
          const newStatus = newBalUSD <= 0 ? 'paid' : 'partial';

          return {
            ...inv,
            paidUSD: newPaidUSD,
            paidLRD: newPaidLRD,
            balanceUSD: newBalUSD,
            balanceLRD: newBalLRD,
            status: newStatus,
          };
        }
        return inv;
      })
    );

    setPayments((prev) => [newPayment, ...prev]);

    // Send instant confirmation SMS
    const methodLabel =
      paymentData.paymentMethod === 'mtn_momo'
        ? 'Lonestar MTN MoMo (*156#)'
        : paymentData.paymentMethod === 'orange_money'
        ? 'Orange Money Liberia (*144#)'
        : paymentData.paymentMethod;

    const smsText = `${currentSchool.name.toUpperCase()} RECEIPT ${receiptNumber}: Confirmed receipt of ${paymentData.amountUSD} USD via ${methodLabel} for ${paymentData.studentName}. Ref: ${paymentData.referenceNumber}. Thank you!`;

    sendSMSBroadcast(
      paymentData.phoneNumber || '+231 77 654 3210',
      paymentData.studentName,
      'payment_receipt',
      smsText
    );

    return newPayment;
  };

  const sendMessage = (msg: Omit<ParentTeacherMessage, 'id' | 'timestamp' | 'isRead'>) => {
    const newMsg: ParentTeacherMessage = {
      ...msg,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      isRead: false,
    };
    setMessages((prev) => [newMsg, ...prev]);

    if (msg.smsSentFallback) {
      sendSMSBroadcast(
        '+231 77 654 3210',
        msg.recipientName,
        'attendance_absence',
        `${currentSchool.name}: New message from ${msg.senderName}: "${msg.message.substring(0, 100)}..."`
      );
    }
  };

  const sendSMSBroadcast = (
    recipientPhone: string,
    recipientName: string,
    category: SMSGatewayLog['category'],
    text: string
  ) => {
    const network: 'Lonestar MTN' | 'Orange Liberia' =
      recipientPhone.startsWith('+231 88') || recipientPhone.startsWith('088')
        ? 'Lonestar MTN'
        : 'Orange Liberia';

    const log: SMSGatewayLog = {
      id: `sms_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      schoolId: currentSchool.id,
      recipientPhone,
      recipientName,
      category,
      messageText: text,
      timestamp: new Date().toLocaleString(),
      network,
      status: connectionMode === 'offline' ? 'queued_offline' : 'delivered',
    };

    setSmsLogs((prev) => [log, ...prev]);
  };

  const updateLiveClassSlide = (classId: string, slideIndex: number) => {
    setLiveClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, activeSlideIndex: slideIndex } : c))
    );
  };

  // Sync Offline items to cloud
  const triggerSyncQueue = async () => {
    if (offlineQueue.length === 0) return;

    // Simulate batch sync
    await new Promise((resolve) => setTimeout(resolve, 800));

    setAttendance((prev) => prev.map((a) => ({ ...a, isSynced: true })));
    setSubmissions((prev) => prev.map((s) => ({ ...s, isSynced: true })));
    setSmsLogs((prev) =>
      prev.map((l) => (l.status === 'queued_offline' ? { ...l, status: 'delivered' } : l))
    );

    setOfflineQueue([]);
  };

  return (
    <AppContext.Provider
      value={{
        schools,
        currentSchool,
        setCurrentSchool,
        users,
        currentUser,
        setCurrentUser,
        switchRole,
        registerNewSchool,

        connectionMode,
        setConnectionMode,
        dataSaverActive,
        setDataSaverActive,
        offlineQueue,
        triggerSyncQueue,
        dataBytesSavedKb,
        isPhysicalOffline,
        effectiveNetworkType,
        networkLatencyMs,
        offlineDiagnosticsModalOpen,
        setOfflineDiagnosticsModalOpen,

        currency,
        setCurrency,
        formatMoney,
        usdToLrdRate: USD_TO_LRD_RATE,

        terms,
        classes,
        attendance,
        markAttendance,
        notifyAbsentParentsSMS,

        lessons,
        toggleDownloadLessonOffline,
        addLesson,

        assignments,
        addAssignment,
        submissions,
        submitAssignment,
        gradeSubmission,

        reportCards,
        updateReportCard,

        invoices,
        payments,
        processPayment,

        messages,
        sendMessage,

        smsLogs,
        sendSMSBroadcast,

        liveClasses,
        updateLiveClassSlide,

        stripePlans,
        stripeInvoices,
        stripeModalOpen,
        setStripeModalOpen,
        targetSchoolForStripe,
        setTargetSchoolForStripe,
        openStripeCheckout,
        processStripeSubscription,
        cancelStripeSubscription,

        isLandingView,
        setIsLandingView,
        loginModalOpen,
        setLoginModalOpen,
        signUpModalOpen,
        setSignUpModalOpen,
        signUpInitialMode,
        setSignUpInitialMode,
        activeRoleModalOpen,
        setActiveRoleModalOpen,
        smsGatewayModalOpen,
        setSmsGatewayModalOpen,
        aiSuiteModalOpen,
        setAiSuiteModalOpen,
        aiSuiteTab,
        setAiSuiteTab,
        openAiSuite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
