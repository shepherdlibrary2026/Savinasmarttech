import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Award,
  CalendarCheck,
  Target,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Layers,
} from 'lucide-react';
import { ReportCard, User } from '../../types';

interface StudentAcademicVisualizerProps {
  reportCard?: ReportCard;
  student: User;
  isParentView?: boolean;
}

export const StudentAcademicVisualizer: React.FC<StudentAcademicVisualizerProps> = ({
  reportCard,
  student,
  isParentView = false,
}) => {
  const [activeMetricTab, setActiveMetricTab] = useState<
    'subject_mastery' | 'term_progression' | 'attendance_trend' | 'moe_benchmark'
  >('subject_mastery');

  // Fallback / standard subjects if no report card
  const subjectsData = (reportCard?.subjects || [
    { name: 'Core Mathematics', caScore: 38, examScore: 56, totalScore: 94, letterGrade: 'A' },
    { name: 'English Language', caScore: 34, examScore: 52, totalScore: 86, letterGrade: 'B' },
    { name: 'Physics / Science', caScore: 36, examScore: 54, totalScore: 90, letterGrade: 'A' },
    { name: 'Liberian Civics', caScore: 37, examScore: 55, totalScore: 92, letterGrade: 'A' },
    { name: 'Biology / Health', caScore: 35, examScore: 50, totalScore: 85, letterGrade: 'B' },
    { name: 'Agric Science', caScore: 36, examScore: 52, totalScore: 88, letterGrade: 'B' },
  ]).map((sub) => {
    // MoE Liberia Standard Benchmark is 70% passing threshold, 85% distinction
    const moeBenchmark = 70;
    const classAvg = Math.max(62, Math.min(84, Math.round(sub.totalScore * 0.88)));
    return {
      subject: sub.name.length > 18 ? sub.name.substring(0, 16) + '...' : sub.name,
      fullName: sub.name,
      studentScore: sub.totalScore,
      caScore: sub.caScore,
      examScore: sub.examScore,
      moeBenchmark,
      classAvg,
      letterGrade: sub.letterGrade,
      differenceFromMoe: sub.totalScore - moeBenchmark,
    };
  });

  // 14-Week Continuous Assessment Term Trajectory
  const termProgressionData = [
    { week: 'W1 (Sep)', studentScore: 82, classAverage: 71, moeTarget: 70, attendanceRate: 100 },
    { week: 'W3 (Quiz 1)', studentScore: 86, classAverage: 73, moeTarget: 70, attendanceRate: 100 },
    { week: 'W6 (Midterm)', studentScore: 88, classAverage: 74, moeTarget: 70, attendanceRate: 98 },
    { week: 'W9 (CA 2)', studentScore: 91, classAverage: 75, moeTarget: 70, attendanceRate: 96 },
    { week: 'W12 (Mock)', studentScore: 93, classAverage: 76, moeTarget: 70, attendanceRate: 100 },
    { week: 'W14 (Final)', studentScore: reportCard?.overallAverage || 89, classAverage: 78, moeTarget: 70, attendanceRate: 100 },
  ];

  // Attendance consistency weekly distribution
  const attendanceWeeklyData = [
    { week: 'Wk 1-2', present: 10, late: 0, excused: 0, attendancePct: 100, moeMinReq: 85 },
    { week: 'Wk 3-4', present: 10, late: 0, excused: 0, attendancePct: 100, moeMinReq: 85 },
    { week: 'Wk 5-6', present: 9, late: 1, excused: 0, attendancePct: 95, moeMinReq: 85 },
    { week: 'Wk 7-8', present: 10, late: 0, excused: 0, attendancePct: 100, moeMinReq: 85 },
    { week: 'Wk 9-10', present: 9, late: 0, excused: 1, attendancePct: 90, moeMinReq: 85 },
    { week: 'Wk 11-12', present: 10, late: 0, excused: 0, attendancePct: 100, moeMinReq: 85 },
    { week: 'Wk 13-14', present: 10, late: 0, excused: 0, attendancePct: 100, moeMinReq: 85 },
  ];

  // Radar chart data for curriculum domains
  const radarDomainData = [
    { domain: 'Mathematics & Numeracy', score: 94, benchmark: 70, nationalAvg: 68 },
    { domain: 'Language Arts & Reading', score: 86, benchmark: 70, nationalAvg: 65 },
    { domain: 'Physical Sciences / STEM', score: 90, benchmark: 70, nationalAvg: 64 },
    { domain: 'Liberian Civics & History', score: 92, benchmark: 70, nationalAvg: 72 },
    { domain: 'Life Sciences & Biology', score: 85, benchmark: 70, nationalAvg: 66 },
    { domain: 'Practical Agriculture', score: 88, benchmark: 70, nationalAvg: 70 },
  ];

  // Attendance Breakdown Pie
  const daysPresent = reportCard?.attendanceDaysPresent || 68;
  const daysTotal = reportCard?.attendanceDaysTotal || 70;
  const daysAbsent = Math.max(0, daysTotal - daysPresent);
  const daysLate = 2;

  const attendancePieData = [
    { name: 'On-Time Present', value: Math.max(0, daysPresent - daysLate), color: '#10b981' },
    { name: 'Late Arrival', value: daysLate, color: '#f59e0b' },
    { name: 'Excused Absence', value: daysAbsent, color: '#ef4444' },
  ];

  const studentAvg = reportCard?.overallAverage || 89.2;
  const moeBenchmarkAvg = 70;
  const growthDelta = (studentAvg - moeBenchmarkAvg).toFixed(1);

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 font-sans z-50">
          <p className="font-bold text-white border-b border-slate-800 pb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.stroke || p.fill }} />
                {p.name}:
              </span>
              <span className="font-mono font-bold text-white">{p.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
      {/* Header with KPI Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" />
              Liberia MoE Curriculum Analytics Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Academic Term 1
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            Academic Performance & Curriculum Growth Trends
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time analytics comparing student continuous assessments against Liberia Ministry of Education standards.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 flex-wrap">
          <button
            onClick={() => setActiveMetricTab('subject_mastery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeMetricTab === 'subject_mastery'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Subject Mastery</span>
          </button>
          <button
            onClick={() => setActiveMetricTab('term_progression')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeMetricTab === 'term_progression'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Term Growth</span>
          </button>
          <button
            onClick={() => setActiveMetricTab('attendance_trend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeMetricTab === 'attendance_trend'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Attendance</span>
          </button>
          <button
            onClick={() => setActiveMetricTab('moe_benchmark')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeMetricTab === 'moe_benchmark'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>MoE Radar</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary Highlight Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
              MoE Benchmark Delta
            </span>
            <div className="text-xl font-black text-emerald-400 mt-0.5 flex items-center gap-1 font-mono">
              +{growthDelta}% <span className="text-xs text-emerald-300 font-normal">above MoE Pass</span>
            </div>
            <span className="text-[10px] text-slate-400">Standard pass benchmark: 70%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
              Attendance Consistency
            </span>
            <div className="text-xl font-black text-teal-300 mt-0.5 font-mono">
              {Math.round((daysPresent / daysTotal) * 100)}%
            </div>
            <span className="text-[10px] text-slate-400">MoE required minimum: 85%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
              WASSCE Readiness Rank
            </span>
            <div className="text-xl font-black text-amber-300 mt-0.5 font-mono">
              {reportCard?.classPosition || 2}nd / {reportCard?.totalStudentsInClass || 32}
            </div>
            <span className="text-[10px] text-slate-400">Top 5% Cohort Standing</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* VIEW 1: Subject Mastery vs MoE Benchmark (Grouped & Target Bar Chart) */}
      {activeMetricTab === 'subject_mastery' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div>
              <h4 className="font-bold text-white text-sm">Subject Score vs Class Average & MoE Pass Benchmark</h4>
              <p className="text-slate-400 text-xs">
                Shows student total score (CA 40% + Exam 60%) compared against the official Liberia MoE 70% threshold.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded bg-emerald-500" /> Student Total Score
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded bg-blue-500" /> Class Average
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-3 h-0.5 bg-rose-500" /> MoE 70% Target
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectsData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'MoE Pass (70%)', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine y={85} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Distinction (85%)', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
                <Bar dataKey="studentScore" name="Student Score" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="classAvg" name="Class Average" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CA vs Exam Score Stack breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2">
            {subjectsData.map((sub, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center">
                <div className="text-[11px] font-semibold text-slate-300 truncate" title={sub.fullName}>
                  {sub.fullName}
                </div>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {sub.studentScore}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  CA: {sub.caScore}/40 • Ex: {sub.examScore}/60
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: Term Progression & Continuous Assessment Growth */}
      {activeMetricTab === 'term_progression' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div>
              <h4 className="font-bold text-white text-sm">14-Week Academic Trajectory & Milestone Exams</h4>
              <p className="text-slate-400 text-xs">
                Tracks cumulative learning velocity from Week 1 through Quizzes, Midterms, and WASSCE Prep.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-0.5 bg-emerald-400" /> Student Score
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-3 h-0.5 bg-blue-400" /> Class Cohort Avg
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-0.5 bg-amber-400" /> MoE Standard (70%)
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={termProgressionData} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[50, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="studentScore" name="Student Score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#scoreGradient)" />
                <Line type="monotone" dataKey="classAverage" name="Class Average" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="moeTarget" name="MoE Benchmark" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Positive Growth Trajectory: +11.0% improvement in continuous assessments over 14 weeks.</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded font-bold">
              Distinction Level
            </span>
          </div>
        </div>
      )}

      {/* VIEW 3: Attendance Consistency & On-Time Rate */}
      {activeMetricTab === 'attendance_trend' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-white text-sm">Bi-Weekly Attendance Consistency Rate</h4>
                <p className="text-slate-400 text-xs">
                  Maintained above Liberia MoE statutory 85% attendance rule for WAEC sitting eligibility.
                </p>
              </div>
              <span className="text-emerald-400 font-bold font-mono">
                {daysPresent} / {daysTotal} Total Days
              </span>
            </div>

            <div className="h-[240px] w-full bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceWeeklyData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[60, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={85} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'MoE 85% Min', fill: '#f43f5e', fontSize: 10 }} />
                  <Bar dataKey="attendancePct" name="Attendance %" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart Breakdown */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Term Presence Breakdown
            </h5>

            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={62}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
              {attendancePieData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}:
                  </span>
                  <span className="font-bold text-white font-mono">{item.value} Days</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: MoE Curriculum Benchmark Radar Comparison */}
      {activeMetricTab === 'moe_benchmark' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-[300px] w-full bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarDomainData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="domain" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
                <Radar name="Student Mastery" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Radar name="MoE Benchmark" dataKey="benchmark" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                <Radar name="National Avg" dataKey="nationalAvg" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Ministry of Education Curriculum Compliance</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                The student meets and exceeds all 6 Liberia MoE Basic & Senior Education Core Competencies. Highest relative strength observed in <strong>Mathematics & Numeracy (94%)</strong> and <strong>Liberian Civics & History (92%)</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">STEM Readiness</span>
                <div className="text-base font-bold text-white font-mono mt-0.5">92.0%</div>
                <p className="text-[10px] text-slate-400">Exceeds national cutoff</p>
              </div>

              <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl">
                <span className="text-[10px] text-blue-400 font-bold uppercase">Language Literacy</span>
                <div className="text-base font-bold text-white font-mono mt-0.5">86.0%</div>
                <p className="text-[10px] text-slate-400">Strong composition skills</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
