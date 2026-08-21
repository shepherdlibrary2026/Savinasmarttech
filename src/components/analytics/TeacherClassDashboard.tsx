import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Send,
  BookOpen,
  Award,
  CalendarCheck,
  Target,
  Sparkles,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Smartphone,
  Check,
  Layers,
  FileSpreadsheet,
  Download,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassGrade, User } from '../../types';

interface StudentRosterMetric {
  id: string;
  name: string;
  avatarUrl?: string;
  parentName: string;
  parentPhone: string;
  overallAverage: number;
  mathScore: number;
  englishScore: number;
  scienceScore: number;
  civicsScore: number;
  attendanceDaysPresent: number;
  attendanceDaysTotal: number;
  attendancePercentage: number;
  missedAssignmentsCount: number;
  letterGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  interventionPriority: 'critical' | 'warning' | 'on_track' | 'distinction';
  weakestSubject: string;
  recommendedAction: string;
}

// Generate realistic class rosters for different classes with MoE grading
const generateClassRosterData = (classId: string): StudentRosterMetric[] => {
  if (classId === 'class_k2_demo') {
    return [
      {
        id: 'student_k2_blessing',
        name: 'Blessing Comfort Doe',
        avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
        parentName: 'Hon. Thomas B. Sherman',
        parentPhone: '+231 77 654 3210',
        overallAverage: 94,
        mathScore: 96,
        englishScore: 92,
        scienceScore: 95,
        civicsScore: 93,
        attendanceDaysPresent: 69,
        attendanceDaysTotal: 70,
        attendancePercentage: 98.5,
        missedAssignmentsCount: 0,
        letterGrade: 'A',
        interventionPriority: 'distinction',
        weakestSubject: 'Story Time',
        recommendedAction: 'Provide advanced phonics level 3 readers.',
      },
      {
        id: 'st_k2_samuel',
        name: 'Samuel K. Weah',
        parentName: 'Mrs. Rebecca Weah',
        parentPhone: '+231 88 123 4567',
        overallAverage: 64,
        mathScore: 60,
        englishScore: 62,
        scienceScore: 70,
        civicsScore: 65,
        attendanceDaysPresent: 54,
        attendanceDaysTotal: 70,
        attendancePercentage: 77.1,
        missedAssignmentsCount: 4,
        letterGrade: 'D',
        interventionPriority: 'critical',
        weakestSubject: 'Numbers & Shapes',
        recommendedAction: 'Schedule remedial phonics and send home tracing exercises.',
      },
      {
        id: 'st_k2_esther',
        name: 'Esther Korboi',
        parentName: 'Mr. Emmanuel Korboi',
        parentPhone: '+231 77 987 6543',
        overallAverage: 78,
        mathScore: 76,
        englishScore: 80,
        scienceScore: 78,
        civicsScore: 80,
        attendanceDaysPresent: 63,
        attendanceDaysTotal: 70,
        attendancePercentage: 90.0,
        missedAssignmentsCount: 1,
        letterGrade: 'B',
        interventionPriority: 'on_track',
        weakestSubject: 'Numbers & Shapes',
        recommendedAction: 'Monitor counting beyond 30.',
      },
      {
        id: 'st_k2_joseph',
        name: 'Josephine Massaquoi',
        parentName: 'Mrs. Sarah Massaquoi',
        parentPhone: '+231 88 555 4321',
        overallAverage: 68,
        mathScore: 66,
        englishScore: 68,
        scienceScore: 72,
        civicsScore: 66,
        attendanceDaysPresent: 58,
        attendanceDaysTotal: 70,
        attendancePercentage: 82.8,
        missedAssignmentsCount: 3,
        letterGrade: 'C',
        interventionPriority: 'warning',
        weakestSubject: 'Early Phonics',
        recommendedAction: 'Audio flashcards for letter-sound association.',
      },
    ];
  }

  // Default Grade 10 Science Stream 10-A (32 students represented in aggregate)
  return [
    {
      id: 'student_g10_alvin',
      name: 'Alvin Siafa Sherman',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      parentName: 'Hon. Thomas B. Sherman',
      parentPhone: '+231 77 654 3210',
      overallAverage: 91.5,
      mathScore: 94,
      englishScore: 86,
      scienceScore: 92,
      civicsScore: 94,
      attendanceDaysPresent: 68,
      attendanceDaysTotal: 70,
      attendancePercentage: 97.1,
      missedAssignmentsCount: 0,
      letterGrade: 'A',
      interventionPriority: 'distinction',
      weakestSubject: 'English Language (Essay)',
      recommendedAction: 'Enroll in WASSCE Math Olympiad club.',
    },
    {
      id: 'st_g10_morris',
      name: 'Morris J. Kollie',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      parentName: 'Elder Tarnue Kollie',
      parentPhone: '+231 88 011 2233',
      overallAverage: 58.0,
      mathScore: 48,
      englishScore: 62,
      scienceScore: 54,
      civicsScore: 68,
      attendanceDaysPresent: 52,
      attendanceDaysTotal: 70,
      attendancePercentage: 74.3,
      missedAssignmentsCount: 5,
      letterGrade: 'F',
      interventionPriority: 'critical',
      weakestSubject: 'WASSCE Core Mathematics',
      recommendedAction: 'Urgent parent conference; assign algebra step-by-step remedial slides.',
    },
    {
      id: 'st_g10_fatu',
      name: 'Fatu K. Kromah',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      parentName: 'Alhaji Vamunyan Kromah',
      parentPhone: '+231 77 334 4556',
      overallAverage: 65.5,
      mathScore: 62,
      englishScore: 68,
      scienceScore: 60,
      civicsScore: 72,
      attendanceDaysPresent: 56,
      attendanceDaysTotal: 70,
      attendancePercentage: 80.0,
      missedAssignmentsCount: 3,
      letterGrade: 'C',
      interventionPriority: 'warning',
      weakestSubject: 'Physics (Kinematics)',
      recommendedAction: 'Assign 3G offline lab audio notes; monitor Friday attendance.',
    },
    {
      id: 'st_g10_gabriel',
      name: 'Gabriel Nimely Jr.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      parentName: 'Mrs. Martha Nimely',
      parentPhone: '+231 88 765 4321',
      overallAverage: 54.5,
      mathScore: 42,
      englishScore: 56,
      scienceScore: 52,
      civicsScore: 68,
      attendanceDaysPresent: 50,
      attendanceDaysTotal: 70,
      attendancePercentage: 71.4,
      missedAssignmentsCount: 6,
      letterGrade: 'F',
      interventionPriority: 'critical',
      weakestSubject: 'WASSCE Core Mathematics',
      recommendedAction: 'MoE At-Risk Flag: Below 70% threshold in Math & Science. Issue remedial packet.',
    },
    {
      id: 'st_g10_helena',
      name: 'Helena G. Tweh',
      avatarUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
      parentName: 'Rev. Boakai Tweh',
      parentPhone: '+231 77 889 9001',
      overallAverage: 84.0,
      mathScore: 82,
      englishScore: 88,
      scienceScore: 80,
      civicsScore: 86,
      attendanceDaysPresent: 67,
      attendanceDaysTotal: 70,
      attendancePercentage: 95.7,
      missedAssignmentsCount: 1,
      letterGrade: 'B',
      interventionPriority: 'on_track',
      weakestSubject: 'Chemistry',
      recommendedAction: 'Maintain current progress; assign peer tutoring role.',
    },
    {
      id: 'st_g10_emmanuel',
      name: 'Emmanuel S. Browne',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      parentName: 'Mr. David Browne',
      parentPhone: '+231 88 223 3445',
      overallAverage: 68.5,
      mathScore: 59,
      englishScore: 74,
      scienceScore: 66,
      civicsScore: 75,
      attendanceDaysPresent: 59,
      attendanceDaysTotal: 70,
      attendancePercentage: 84.2,
      missedAssignmentsCount: 2,
      letterGrade: 'C',
      interventionPriority: 'warning',
      weakestSubject: 'WASSCE Core Mathematics',
      recommendedAction: 'Math CA score is 59% (1% under MoE benchmark). Provide after-school review.',
    },
    {
      id: 'st_g10_precious_d',
      name: 'Precious D. Sirleaf',
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      parentName: 'Madam Cecelia Sirleaf',
      parentPhone: '+231 77 445 5667',
      overallAverage: 88.0,
      mathScore: 86,
      englishScore: 90,
      scienceScore: 85,
      civicsScore: 91,
      attendanceDaysPresent: 68,
      attendanceDaysTotal: 70,
      attendancePercentage: 97.1,
      missedAssignmentsCount: 0,
      letterGrade: 'A',
      interventionPriority: 'distinction',
      weakestSubject: 'Physics',
      recommendedAction: 'Nominate for National STEM scholarship program.',
    },
    {
      id: 'st_g10_sam_t',
      name: 'Samson T. Jallah',
      parentName: 'Mr. Jallah Gbarbea',
      parentPhone: '+231 88 998 8776',
      overallAverage: 62.0,
      mathScore: 55,
      englishScore: 64,
      scienceScore: 60,
      civicsScore: 69,
      attendanceDaysPresent: 53,
      attendanceDaysTotal: 70,
      attendancePercentage: 75.7,
      missedAssignmentsCount: 4,
      letterGrade: 'C',
      interventionPriority: 'critical',
      weakestSubject: 'Core Mathematics & Physics',
      recommendedAction: 'Low attendance triggering MoE warning. Dispatch parent SMS alert.',
    },
  ];
};

export const TeacherClassDashboard: React.FC<{
  selectedClassId: string;
  onSelectClassId?: (classId: string) => void;
}> = ({ selectedClassId, onSelectClassId }) => {
  const { classes, notifyAbsentParentsSMS, addAssignment, currentSchool } = useApp();

  const [activeFilter, setActiveFilter] = useState<
    'all' | 'critical' | 'warning' | 'on_track' | 'distinction'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentRosterMetric | null>(null);
  const [smsSendingStudentId, setSmsSendingStudentId] = useState<string | null>(null);
  const [smsSentSuccessMessage, setSmsSentSuccessMessage] = useState<string | null>(null);
  const [remedialModalOpen, setRemedialModalOpen] = useState(false);
  const [targetStudentForRemedial, setTargetStudentForRemedial] = useState<StudentRosterMetric | null>(null);
  const [remedialSubject, setRemedialSubject] = useState('WASSCE Core Mathematics');
  const [remedialTitle, setRemedialTitle] = useState('Quadratic Formulas & Factorization Remedial Packet');

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const roster = useMemo(() => {
    return generateClassRosterData(selectedClassId);
  }, [selectedClassId]);

  // Aggregate Metrics
  const classAvgScore = useMemo(() => {
    if (!roster.length) return 0;
    const sum = roster.reduce((acc, curr) => acc + curr.overallAverage, 0);
    return Math.round((sum / roster.length) * 10) / 10;
  }, [roster]);

  const classAvgAttendance = useMemo(() => {
    if (!roster.length) return 0;
    const sum = roster.reduce((acc, curr) => acc + curr.attendancePercentage, 0);
    return Math.round((sum / roster.length) * 10) / 10;
  }, [roster]);

  const moePassingRate = useMemo(() => {
    if (!roster.length) return 0;
    const passingCount = roster.filter((s) => s.overallAverage >= 70).length;
    return Math.round((passingCount / roster.length) * 100);
  }, [roster]);

  const criticalCount = useMemo(
    () => roster.filter((s) => s.interventionPriority === 'critical').length,
    [roster]
  );
  const warningCount = useMemo(
    () => roster.filter((s) => s.interventionPriority === 'warning').length,
    [roster]
  );
  const distinctionCount = useMemo(
    () => roster.filter((s) => s.interventionPriority === 'distinction').length,
    [roster]
  );

  // Recharts Chart Data 1: MoE Grade Band Distribution
  const gradeDistributionData = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    roster.forEach((s) => {
      counts[s.letterGrade] = (counts[s.letterGrade] || 0) + 1;
    });

    return [
      { grade: 'Grade A (85-100%)', count: counts.A, label: 'Distinction (WAEC A1-B2)', color: '#10b981', benchmark: 'Target >= 25%' },
      { grade: 'Grade B (70-84%)', count: counts.B, label: 'Credit (MoE Pass B3-C6)', color: '#3b82f6', benchmark: 'Target >= 50%' },
      { grade: 'Grade C (60-69%)', count: counts.C, label: 'Pass (Borderline D7-E8)', color: '#f59e0b', benchmark: 'At-Risk' },
      { grade: 'Grade F (<60%)', count: counts.F, label: 'Fail / Remedial Needed', color: '#ef4444', benchmark: 'Critical' },
    ];
  }, [roster]);

  // Recharts Chart Data 2: Subject-by-Subject Averages vs MoE 70% Cutoff
  const subjectAveragesData = useMemo(() => {
    if (!roster.length) return [];
    const avgMath = Math.round(roster.reduce((a, b) => a + b.mathScore, 0) / roster.length);
    const avgEnglish = Math.round(roster.reduce((a, b) => a + b.englishScore, 0) / roster.length);
    const avgScience = Math.round(roster.reduce((a, b) => a + b.scienceScore, 0) / roster.length);
    const avgCivics = Math.round(roster.reduce((a, b) => a + b.civicsScore, 0) / roster.length);

    return [
      { subject: 'Core Math', classAverage: avgMath, moeBenchmark: 70, distinction: 85, studentsBelowMoE: roster.filter((s) => s.mathScore < 70).length },
      { subject: 'English Lang', classAverage: avgEnglish, moeBenchmark: 70, distinction: 85, studentsBelowMoE: roster.filter((s) => s.englishScore < 70).length },
      { subject: 'Science / Physics', classAverage: avgScience, moeBenchmark: 70, distinction: 85, studentsBelowMoE: roster.filter((s) => s.scienceScore < 70).length },
      { subject: 'Liberian Civics', classAverage: avgCivics, moeBenchmark: 70, distinction: 85, studentsBelowMoE: roster.filter((s) => s.civicsScore < 70).length },
    ];
  }, [roster]);

  // Recharts Chart Data 3: Attendance Consistency vs Academic Performance Scatter
  const correlationData = useMemo(() => {
    return roster.map((s) => ({
      name: s.name,
      attendance: s.attendancePercentage,
      academicScore: s.overallAverage,
      status: s.interventionPriority,
      size: s.missedAssignmentsCount > 0 ? 120 : 70,
    }));
  }, [roster]);

  // Filtered Roster for Table
  const filteredStudents = useMemo(() => {
    return roster.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.weakestSubject.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeFilter === 'all') return true;
      return s.interventionPriority === activeFilter;
    });
  }, [roster, searchQuery, activeFilter]);

  // Dispatch MoE Parent Alert SMS
  const handleSendMoEAlertSMS = (student: StudentRosterMetric) => {
    setSmsSendingStudentId(student.id);
    setTimeout(() => {
      setSmsSendingStudentId(null);
      setSmsSentSuccessMessage(
        `Sent MoE Remedial Warning SMS to parent of ${student.name} (${student.parentPhone}): "Alert: ${student.name}'s current continuous assessment in ${student.weakestSubject} is below Liberia MoE 70% benchmark. Please support with home assignments."`
      );
      setTimeout(() => setSmsSentSuccessMessage(null), 5000);
    }, 900);
  };

  // Open Remedial Assignment Creator
  const handleOpenRemedial = (student: StudentRosterMetric) => {
    setTargetStudentForRemedial(student);
    setRemedialSubject(student.weakestSubject);
    setRemedialTitle(`${student.weakestSubject} - MoE Targeted Mastery Booster`);
    setRemedialModalOpen(true);
  };

  const handleSaveRemedial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentForRemedial) return;

    addAssignment({
      schoolId: currentSchool.id,
      classId: selectedClassId,
      subject: remedialSubject,
      title: remedialTitle,
      description: `Targeted remedial assignment for ${targetStudentForRemedial.name} to bridge curriculum gaps prior to WASSCE Continuous Assessment reconciliation.`,
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      totalPoints: 20,
      tier: 'senior_high',
      questions: [
        {
          id: 'rem_q1',
          questionText: `Solve the foundational ${remedialSubject} practice exercise with detailed steps.`,
          options: ['Step 1: Simplify brackets', 'Step 2: Collect like terms', 'Step 3: Solve for variable', 'All of the above'],
          correctAnswerIndex: 3,
          explanation: 'Mastering the fundamental rules ensures full continuous assessment marks.',
          points: 10,
          type: 'multiple_choice',
        },
      ],
    });

    setRemedialModalOpen(false);
    setSmsSentSuccessMessage(
      `Remedial Assignment "${remedialTitle}" assigned to ${targetStudentForRemedial.name} with offline audio notes!`
    );
    setTimeout(() => setSmsSentSuccessMessage(null), 4000);
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1 z-50">
          <p className="font-bold text-white border-b border-slate-800 pb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill || p.stroke }} />
                {p.name}:
              </span>
              <span className="font-mono font-bold text-white">{p.value}{typeof p.value === 'number' && p.value <= 100 ? '%' : ''}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {smsSentSuccessMessage && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500/60 rounded-2xl text-emerald-300 text-xs flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="leading-relaxed">{smsSentSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSmsSentSuccessMessage(null)}
            className="text-emerald-400 hover:text-white font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Class Performance Summary Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Class Performance & MoE Standards Dashboard
                </h3>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                  {currentClass?.gradeLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring continuous assessments against the 70% passing threshold and 85% attendance rule defined by the Republic of Liberia Ministry of Education.
              </p>
            </div>
          </div>

          {/* Class Stream Switcher */}
          {onSelectClassId && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Switch Stream:</span>
              <select
                value={selectedClassId}
                onChange={(e) => onSelectClassId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.gradeLevel} ({cls.sectionName})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 4 Key Performance Indicators (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Class Average Score */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Class Average CA
              </span>
              <div className="text-2xl font-black text-white font-mono mt-0.5 flex items-center gap-1.5">
                {classAvgScore}%
                {classAvgScore >= 70 ? (
                  <span className="text-xs text-emerald-400 font-normal flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Above MoE Pass
                  </span>
                ) : (
                  <span className="text-xs text-rose-400 font-normal flex items-center">
                    <ArrowDownRight className="w-3.5 h-3.5" /> Below Cutoff
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                MoE Benchmark: 70.0% Minimum
              </span>
            </div>
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner ${
                classAvgScore >= 70
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              <Award className="w-5 h-5" />
            </div>
          </div>

          {/* MoE Benchmark Compliance Rate */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                MoE Standard Pass Rate
              </span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {moePassingRate}%
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {roster.filter((s) => s.overallAverage >= 70).length} of {roster.length} students ≥ 70%
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Target className="w-5 h-5" />
            </div>
          </div>

          {/* Attendance Consistency */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Average Attendance
              </span>
              <div className="text-2xl font-black text-teal-300 font-mono mt-0.5">
                {classAvgAttendance}%
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                WAEC Statutory Min: 85%
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300 shadow-inner">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>

          {/* At-Risk Intervention Needed */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Needs MoE Intervention
              </span>
              <div className="text-2xl font-black text-rose-400 font-mono mt-0.5 flex items-center gap-1.5">
                {criticalCount + warningCount}{' '}
                <span className="text-xs text-rose-300 font-normal">
                  ({criticalCount} Critical)
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Targeted for remedial packets
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Subject-by-Subject Averages vs MoE 70% Standard Cutoff */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span>📊</span> Subject Scores vs MoE Passing Standard (70%)
              </h4>
              <p className="text-slate-400 text-xs">
                Shows class mastery per subject against the national standard threshold.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1 text-slate-300 text-[11px]">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Class Avg
              </span>
              <span className="flex items-center gap-1 text-rose-400 text-[11px]">
                <span className="w-2.5 h-0.5 bg-rose-500" /> MoE 70% Pass
              </span>
            </div>
          </div>

          <div className="h-[250px] w-full bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAveragesData} margin={{ top: 20, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[40, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'MoE 70% Pass', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine y={85} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Distinction 85%', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
                <Bar dataKey="classAverage" name="Class Average" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={38}>
                  {subjectAveragesData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.classAverage >= 75 ? '#10b981' : entry.classAverage >= 70 ? '#3b82f6' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {subjectAveragesData.map((s, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-center">
                <span className="text-[10px] text-slate-400 block truncate">{s.subject}</span>
                <span
                  className={`text-sm font-bold font-mono mt-0.5 block ${
                    s.classAverage >= 70 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {s.classAverage}%
                </span>
                <span className="text-[9px] text-slate-500">{s.studentsBelowMoE} at risk</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: MoE Grade Band Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span>🎯</span> Grade Band Distribution (WAEC / MoE Scale)
              </h4>
              <p className="text-slate-400 text-xs">
                Stratification of pupils into Distinction, Credit, Pass, and Critical Remedial cohorts.
              </p>
            </div>
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
              Total: {roster.length} Students
            </span>
          </div>

          <div className="h-[250px] w-full bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistributionData} layout="vertical" margin={{ top: 10, right: 25, left: 35, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="grade" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Student Count" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {gradeDistributionData.map((g, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-center">
                <span className="text-[10px] text-slate-400 block truncate">{g.label.split(' ')[0]}</span>
                <span className="text-sm font-bold font-mono mt-0.5 block" style={{ color: g.color }}>
                  {g.count} Students
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {Math.round((g.count / roster.length) * 100)}% of Class
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHART 3: Attendance Consistency vs Academic Performance (Correlation View) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span>📈</span> Attendance Rate vs Continuous Assessment Score Correlation
            </h4>
            <p className="text-slate-400 text-xs">
              Students falling in the lower-left red quadrant fail the MoE 70% score cutoff and 85% attendance rule simultaneously.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> On-Track / Distinction
            </span>
            <span className="flex items-center gap-1 text-rose-400 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical Remedial Priority
            </span>
          </div>
        </div>

        <div className="h-[260px] w-full bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 15, right: 20, bottom: 15, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis
                type="number"
                dataKey="attendance"
                name="Attendance Rate"
                unit="%"
                domain={[65, 100]}
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                label={{ value: 'Attendance Rate (%)', fill: '#94a3b8', fontSize: 10, position: 'insideBottom', offset: -10 }}
              />
              <YAxis
                type="number"
                dataKey="academicScore"
                name="Academic CA Score"
                unit="%"
                domain={[40, 100]}
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                label={{ value: 'CA Score (%)', fill: '#94a3b8', fontSize: 10, angle: -90, position: 'insideLeft' }}
              />
              <ZAxis dataKey="size" range={[60, 180]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <ReferenceLine x={85} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '85% Attendance Min', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'MoE 70% Pass Cutoff', fill: '#f43f5e', fontSize: 10 }} />
              <Scatter name="Students" data={correlationData} fill="#10b981">
                {correlationData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.status === 'critical'
                        ? '#ef4444'
                        : entry.status === 'warning'
                        ? '#f59e0b'
                        : '#10b981'
                    }
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MoE Intervention Roster & Action Hub */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Student Intervention & Remedial Action Roster
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Identify pupils with curriculum deficits and trigger automated Liberia GSM parent alerts or targeted assignments.
            </p>
          </div>

          {/* Filter Pills & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student or weak topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 w-48 sm:w-60"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  activeFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({roster.length})
              </button>
              <button
                onClick={() => setActiveFilter('critical')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  activeFilter === 'critical'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-400 hover:bg-rose-950/40'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Critical ({criticalCount})</span>
              </button>
              <button
                onClick={() => setActiveFilter('warning')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  activeFilter === 'warning'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-400 hover:bg-amber-950/40'
                }`}
              >
                Warning ({warningCount})
              </button>
              <button
                onClick={() => setActiveFilter('distinction')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  activeFilter === 'distinction'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-400 hover:bg-emerald-950/40'
                }`}
              >
                Distinction ({distinctionCount})
              </button>
            </div>
          </div>
        </div>

        {/* Table of Students */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">CA Average</th>
                <th className="p-3.5">Attendance</th>
                <th className="p-3.5">Subject Breakdown</th>
                <th className="p-3.5">Intervention Priority</th>
                <th className="p-3.5">Recommended Action</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredStudents.map((st) => {
                const isCritical = st.interventionPriority === 'critical';
                const isWarning = st.interventionPriority === 'warning';
                const isDistinction = st.interventionPriority === 'distinction';

                return (
                  <tr
                    key={st.id}
                    className={`transition hover:bg-slate-800/60 ${
                      isCritical ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    {/* Student Info */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        {st.avatarUrl ? (
                          <img
                            src={st.avatarUrl}
                            alt={st.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                            {st.name[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-xs">{st.name}</div>
                          <div className="text-[10px] text-slate-400">
                            Parent: {st.parentName} ({st.parentPhone})
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Overall Score */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono font-bold text-sm ${
                            st.overallAverage >= 85
                              ? 'text-emerald-400'
                              : st.overallAverage >= 70
                              ? 'text-blue-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {st.overallAverage}%
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                            st.letterGrade === 'A'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : st.letterGrade === 'B'
                              ? 'bg-blue-500/20 text-blue-300'
                              : st.letterGrade === 'C'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {st.letterGrade}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {st.overallAverage >= 70 ? 'MoE Passing' : 'Below 70% Threshold'}
                      </span>
                    </td>

                    {/* Attendance */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono font-bold text-xs ${
                            st.attendancePercentage >= 85 ? 'text-teal-300' : 'text-rose-400'
                          }`}
                        >
                          {st.attendancePercentage}%
                        </span>
                        {st.attendancePercentage < 85 && (
                          <span className="text-[9px] bg-rose-950 text-rose-300 px-1 py-0.2 rounded border border-rose-800">
                            WAEC Risk
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {st.attendanceDaysPresent}/{st.attendanceDaysTotal} Days
                      </span>
                    </td>

                    {/* Subject Scores Pill */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1 text-[10px] font-mono flex-wrap max-w-xs">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            st.mathScore >= 70
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-rose-950 text-rose-300 border border-rose-800 font-bold'
                          }`}
                          title="Core Mathematics"
                        >
                          Math: {st.mathScore}%
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            st.englishScore >= 70
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-rose-950 text-rose-300 border border-rose-800 font-bold'
                          }`}
                          title="English Language"
                        >
                          Eng: {st.englishScore}%
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            st.scienceScore >= 70
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-rose-950 text-rose-300 border border-rose-800 font-bold'
                          }`}
                          title="Physics / Science"
                        >
                          Sci: {st.scienceScore}%
                        </span>
                      </div>
                      <div className="text-[10px] text-rose-400 mt-1 truncate">
                        Deficit: {st.weakestSubject}
                      </div>
                    </td>

                    {/* Intervention Status Priority */}
                    <td className="p-3.5">
                      {isCritical && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> Critical Deficit
                        </span>
                      )}
                      {isWarning && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <AlertTriangle className="w-3 h-3" /> Moderate Warning
                        </span>
                      )}
                      {st.interventionPriority === 'on_track' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          <Check className="w-3 h-3" /> On Track
                        </span>
                      )}
                      {isDistinction && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <Sparkles className="w-3 h-3 text-amber-300" /> MoE Distinction
                        </span>
                      )}
                    </td>

                    {/* Recommended Action */}
                    <td className="p-3.5 text-[11px] text-slate-300 max-w-xs">
                      {st.recommendedAction}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Send MoE SMS Alert */}
                        {(isCritical || isWarning) && (
                          <button
                            onClick={() => handleSendMoEAlertSMS(st)}
                            disabled={smsSendingStudentId === st.id}
                            className="p-1.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg border border-amber-500/40 text-xs transition"
                            title="Dispatch MoE Remedial Warning SMS to Parent"
                          >
                            <Smartphone
                              className={`w-3.5 h-3.5 ${
                                smsSendingStudentId === st.id ? 'animate-spin' : ''
                              }`}
                            />
                          </button>
                        )}

                        {/* Assign Targeted Remedial */}
                        <button
                          onClick={() => handleOpenRemedial(st)}
                          className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg border border-emerald-500/40 text-xs font-semibold transition flex items-center gap-1"
                          title="Create targeted remedial worksheet"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Remedial</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Targeted Remedial Assignment Creator */}
      {remedialModalOpen && targetStudentForRemedial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Create MoE Remedial Assignment
                  </h4>
                  <p className="text-xs text-slate-400">
                    Targeted student: <strong className="text-white">{targetStudentForRemedial.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRemedialModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRemedial} className="space-y-3 text-xs text-slate-300">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Subject Focus</label>
                <input
                  type="text"
                  required
                  value={remedialSubject}
                  onChange={(e) => setRemedialSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Remedial Title</label>
                <input
                  type="text"
                  required
                  value={remedialTitle}
                  onChange={(e) => setRemedialTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase">Auto-Generated Remedial Scope</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Includes 5 foundational practice questions and downloadable audio slides designed to raise student Continuous Assessment from current {targetStudentForRemedial.overallAverage}% to above the 70% MoE standard.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRemedialModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition"
                >
                  Publish & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
