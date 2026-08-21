import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  BookOpen,
  Send,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Radio,
  Sparkles,
  Volume2,
  Calendar,
  Layers,
  Save,
  Wand2,
  BarChart3,
  Target,
  ShieldAlert,
} from 'lucide-react';
import { GeminiMoELessonGenerator } from './GeminiMoELessonGenerator';
import { TeacherClassDashboard } from '../analytics/TeacherClassDashboard';

export const TeacherPortal: React.FC<{
  subTab?: string;
  onNavigateToLive?: () => void;
}> = ({ subTab = 'teacher_analytics', onNavigateToLive }) => {
  const {
    currentUser,
    currentSchool,
    classes,
    users,
    attendance,
    markAttendance,
    notifyAbsentParentsSMS,
    lessons,
    addLesson,
    assignments,
    addAssignment,
    submissions,
    gradeSubmission,
    connectionMode,
    reportCards,
    updateReportCard,
    openAiSuite,
  } = useApp();

  const [activeTab, setActiveTab] = useState(subTab);

  React.useEffect(() => {
    if (subTab) {
      setActiveTab(subTab);
    }
  }, [subTab]);
  const [selectedClassId, setSelectedClassId] = useState(
    currentUser.assignedClassIds?.[0] || classes[0]?.id || 'class_g10_demo'
  );
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendancePeriod, setAttendancePeriod] = useState('Period 1 - Mathematics');
  const [smsAlertSentCount, setSmsAlertSentCount] = useState<number | null>(null);

  // Lesson creator modal state
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    subject: 'WASSCE Core Mathematics',
    gradeLevel: 'Grade 10 (Senior High)',
    tier: 'senior_high' as any,
    topic: '',
    description: '',
    readAloudText: '',
    estimatedDataKb: 350,
    videoDataMb: 42.0,
    slides: [
      {
        slideNumber: 1,
        title: 'Core Concept Definition',
        content: 'Write the fundamental formulas and definitions here.',
        bulletPoints: ['Point 1: Key definition', 'Point 2: Examination rule'],
      },
    ],
  });

  // Active class info
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Students in selected class
  const classStudents = users.filter((u) => {
    if (u.role !== 'student') return false;
    if (selectedClassId === 'class_k2_demo') return u.id === 'student_k2_blessing';
    if (selectedClassId === 'class_g10_demo') return u.id === 'student_g10_alvin';
    if (selectedClassId === 'class_g12_demo') return u.id === 'student_g12_precious';
    return true;
  });

  // Handle marking single student attendance
  const handleMarkStudent = (
    studentId: string,
    studentName: string,
    status: 'present' | 'absent' | 'late' | 'excused'
  ) => {
    markAttendance({
      schoolId: currentSchool.id,
      classId: selectedClassId,
      studentId,
      studentName,
      date: attendanceDate,
      period: attendancePeriod,
      status,
      markedByTeacherId: currentUser.id,
      notes: `Marked by ${currentUser.name}`,
      smsSentToParent: false,
    });
  };

  // 1-Click Send SMS to absent parents
  const handleNotifyAbsentSMS = () => {
    const count = notifyAbsentParentsSMS(selectedClassId, attendanceDate);
    setSmsAlertSentCount(count);
    setTimeout(() => setSmsAlertSentCount(null), 4000);
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonFormData.title) return;

    addLesson({
      schoolId: currentSchool.id,
      ...lessonFormData,
    });
    setIsAddLessonOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Teacher Workspace Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Teacher Classroom Workspace
              </h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {currentUser.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Subjects: {currentUser.teachingSubjects?.join(' • ') || 'All Subjects'}
            </p>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('teacher_analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'teacher_analytics'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-emerald-950/70 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-500/40'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Class Performance & MoE Standards</span>
          </button>
          <button
            onClick={() => setActiveTab('teacher_ai_generator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'teacher_ai_generator'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI MoE Lesson Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('teacher_attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'teacher_attendance'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Attendance Register
          </button>
          <button
            onClick={() => setActiveTab('teacher_gradebook')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'teacher_gradebook'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Continuous Assessment (CA)
          </button>
          <button
            onClick={() => setActiveTab('teacher_lessons')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'teacher_lessons'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Lesson Notes
          </button>
          {onNavigateToLive && (
            <button
              onClick={onNavigateToLive}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow flex items-center gap-1.5 transition"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Launch Live Class
            </button>
          )}
        </div>
      </div>

      {/* Gemini AI Quick Teacher Toolkit */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Teacher AI Co-Pilot & Studio</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold">
                Gemini & Veo & Lyria
              </span>
            </div>
            <p className="text-xs text-slate-400">
              One-click access to Search Grounding, Voice Tutoring, Lyria Rhymes, Diagrams, Video & Speech-to-Text.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('teacher_ai_generator')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 text-xs font-bold transition flex items-center gap-1 shadow-sm"
          >
            ✨ MoE Lesson Generator
          </button>
          <button
            onClick={() => openAiSuite('search')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-semibold transition flex items-center gap-1"
          >
            🔍 Search Grounding
          </button>
          <button
            onClick={() => openAiSuite('chat')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition flex items-center gap-1"
          >
            💬 Chatbot
          </button>
          <button
            onClick={() => openAiSuite('voice')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center gap-1"
          >
            🎙️ Live Voice
          </button>
          <button
            onClick={() => openAiSuite('music')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center gap-1"
          >
            🎵 Lyria Music
          </button>
          <button
            onClick={() => openAiSuite('image')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-semibold transition flex items-center gap-1"
          >
            🎨 Diagram Studio
          </button>
          <button
            onClick={() => openAiSuite('video')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center gap-1"
          >
            🎬 Veo Video
          </button>
          <button
            onClick={() => openAiSuite('transcribe')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-300 border border-pink-500/30 text-xs font-semibold transition flex items-center gap-1"
          >
            📝 Transcribe
          </button>
        </div>
      </div>

      {/* Class & Date Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
              Select Class Stream
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.gradeLevel} - {cls.sectionName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
              Register Date
            </label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
              Period
            </label>
            <select
              value={attendancePeriod}
              onChange={(e) => setAttendancePeriod(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Period 1 - Mathematics">Period 1 - Mathematics</option>
              <option value="Period 2 - English Language">Period 2 - English Language</option>
              <option value="Period 3 - Science / Civics">Period 3 - Science / Civics</option>
              <option value="Full Day Register">Full Day Register</option>
            </select>
          </div>
        </div>

        {activeTab === 'teacher_attendance' && (
          <button
            onClick={handleNotifyAbsentSMS}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md transition"
            title="Sends instant SMS to parents of any absent/late pupils"
          >
            <Send className="w-3.5 h-3.5" /> 1-Click Absent Parent SMS Alert
          </button>
        )}
      </div>

      {/* SMS notification trigger toast */}
      {smsAlertSentCount !== null && (
        <div className="p-3 bg-emerald-950 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>
              Dispatched SMS absence notices to {smsAlertSentCount} parent mobile numbers via Liberia GSM Gateway!
            </span>
          </div>
        </div>
      )}

      {/* TAB: Class Performance & MoE Standards Dashboard */}
      {activeTab === 'teacher_analytics' && (
        <TeacherClassDashboard
          selectedClassId={selectedClassId}
          onSelectClassId={setSelectedClassId}
        />
      )}

      {/* TAB 0: Gemini AI MoE Curriculum Lesson Plan Generator */}
      {activeTab === 'teacher_ai_generator' && <GeminiMoELessonGenerator />}

      {/* TAB 1: Attendance Register Sheet */}
      {activeTab === 'teacher_attendance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Daily Roll Call — {currentClass?.gradeLevel}
              </h3>
              <p className="text-xs text-slate-400">
                Tap status button to record. Operates offline and automatically queues sync.
              </p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
              {classStudents.length} Students in Register
            </span>
          </div>

          <div className="space-y-2.5">
            {classStudents.map((student) => {
              const record = attendance.find(
                (a) =>
                  a.studentId === student.id &&
                  a.date === attendanceDate &&
                  a.period === attendancePeriod
              );
              const currentStatus = record?.status || 'present';

              return (
                <div
                  key={student.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-600 transition"
                >
                  <div className="flex items-center gap-3">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-600"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">
                        {student.name[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white text-sm">{student.name}</div>
                      <div className="text-xs text-slate-400">
                        {student.section || currentClass?.sectionName}
                      </div>
                    </div>
                  </div>

                  {/* Quick Attendance Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleMarkStudent(student.id, student.name, 'present')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-900/80 text-slate-400 hover:text-emerald-300'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Present
                    </button>
                    <button
                      onClick={() => handleMarkStudent(student.id, student.name, 'absent')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        currentStatus === 'absent'
                          ? 'bg-rose-600 text-white shadow'
                          : 'bg-slate-900/80 text-slate-400 hover:text-rose-300'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" /> Absent
                    </button>
                    <button
                      onClick={() => handleMarkStudent(student.id, student.name, 'late')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        currentStatus === 'late'
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-slate-900/80 text-slate-400 hover:text-amber-300'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" /> Late
                    </button>
                    <button
                      onClick={() => handleMarkStudent(student.id, student.name, 'excused')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        currentStatus === 'excused'
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-slate-900/80 text-slate-400 hover:text-blue-300'
                      }`}
                    >
                      Excused
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Continuous Assessment (CA) & WASSCE Gradebook */}
      {activeTab === 'teacher_gradebook' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white">
                Continuous Assessment (CA 40% + Exam 60%) Gradebook
              </h3>
              <p className="text-xs text-slate-400">
                Official Liberia MoE & WAEC standard grading scale (90-100: A, 80-89: B, 70-79: C, 60-69: D, &lt;60: F).
              </p>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40 font-medium">
              WAEC Grading Standard
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Quizzes (20%)</th>
                  <th className="p-3">Homework (20%)</th>
                  <th className="p-3">Exam (60%)</th>
                  <th className="p-3">Total /100</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">WAEC Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {classStudents.map((st) => {
                  const repCard = reportCards.find((r) => r.studentId === st.id);
                  const firstSub = repCard?.subjects[0] || {
                    caScore: 36,
                    examScore: 54,
                    totalScore: 90,
                    letterGrade: 'A',
                    remark: 'Distinction / Excellent',
                  };

                  return (
                    <tr key={st.id} className="hover:bg-slate-800/60 transition">
                      <td className="p-3 font-semibold text-white">{st.name}</td>
                      <td className="p-3 text-slate-300 font-mono">18 / 20</td>
                      <td className="p-3 text-slate-300 font-mono">19 / 20</td>
                      <td className="p-3 text-slate-300 font-mono">{firstSub.examScore} / 60</td>
                      <td className="p-3 font-bold text-emerald-400 font-mono text-sm">
                        {firstSub.totalScore}%
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-black ${
                            firstSub.letterGrade === 'A'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {firstSub.letterGrade}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{firstSub.remark}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Lesson Notes & Planner */}
      {activeTab === 'teacher_lessons' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white">Curriculum Lesson Plans & Notes</h3>
              <p className="text-xs text-slate-400">
                Create ultra-low-bandwidth slides and audio notes optimized for student 3G data.
              </p>
            </div>
            <button
              onClick={() => setIsAddLessonOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Lesson Pack
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 font-semibold uppercase">
                      {lesson.subject}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-1">{lesson.title}</h4>
                  </div>
                  <span className="text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700 font-mono shrink-0">
                    {lesson.estimatedDataKb} KB
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">{lesson.description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700">
                  <span>{lesson.slides.length} Slide Cards</span>
                  <span>{lesson.gradeLevel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {isAddLessonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Create Low-Bandwidth Lesson Pack</h3>
                <p className="text-xs text-slate-400">Audio notes & structured slides.</p>
              </div>
              <button
                onClick={() => setIsAddLessonOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WASSCE Core Math: Trigonometric Identities"
                  value={lessonFormData.title}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={lessonFormData.subject}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, subject: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Grade Level</label>
                  <input
                    type="text"
                    required
                    value={lessonFormData.gradeLevel}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, gradeLevel: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Overview Description</label>
                <textarea
                  rows={3}
                  required
                  value={lessonFormData.description}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLessonOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs shadow-md"
                >
                  Publish Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
