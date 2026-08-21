import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LessonMaterial, Assignment } from '../../types';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Sparkles,
  Award,
  BookOpen,
  Download,
  CheckCircle2,
  Play,
  FileText,
  Clock,
  ArrowRight,
  Flame,
  Star,
  Zap,
  HelpCircle,
  Video,
  Radio,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { StudentAcademicVisualizer } from '../analytics/StudentAcademicVisualizer';

export const StudentPortal: React.FC<{ subTab?: string }> = ({ subTab = 'student_dashboard' }) => {
  const {
    currentUser,
    lessons,
    toggleDownloadLessonOffline,
    assignments,
    submissions,
    submitAssignment,
    reportCards,
    dataSaverActive,
    openAiSuite,
  } = useApp();

  const [activeTab, setActiveTab] = useState(subTab);
  const [activeLesson, setActiveLesson] = useState<LessonMaterial | null>(null);
  const [mediaMode, setMediaMode] = useState<'slides_audio' | 'video'>('slides_audio');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<Assignment | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Text-To-Speech (Read Aloud for young kids)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // clear pacing for kids
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  const isKid = currentUser.studentTier === 'k3_early';

  // Filter lessons for student's grade/tier
  const studentLessons = lessons.filter((l) => {
    if (isKid) return l.tier === 'k3_early';
    return l.tier === 'senior_high' || l.tier === 'junior_high';
  });

  // Filter assignments
  const studentAssignments = assignments.filter((a) => {
    if (isKid) return a.tier === 'k3_early';
    return a.tier === 'senior_high' || a.tier === 'junior_high';
  });

  // Report Card for this student
  const studentReport = reportCards.find((r) => r.studentId === currentUser.id);

  // Handle Quiz Submission
  const handleSubmitQuiz = () => {
    if (!activeQuiz || !activeQuiz.questions) return;

    let earned = 0;
    const answersArray: { questionId: string; answer: number }[] = [];

    activeQuiz.questions.forEach((q) => {
      const selected = selectedAnswers[q.id];
      answersArray.push({ questionId: q.id, answer: selected ?? -1 });
      if (selected === q.correctAnswerIndex) {
        earned += q.points;
      }
    });

    submitAssignment({
      assignmentId: activeQuiz.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      answers: answersArray,
      score: earned,
      totalPoints: activeQuiz.totalPoints,
      teacherFeedback:
        earned === activeQuiz.totalPoints
          ? '🌟 Outstanding! 100% score!'
          : 'Good effort! Review the lesson notes.',
      status: 'graded',
    });

    setQuizScore(earned);
    setQuizSubmitted(true);

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  /* =========================================================================
     KID EXPLORER MODE (K-3)
     ========================================================================= */
  if (isKid) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Playful Header */}
        <div className="bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl shadow-inner animate-bounce">
                🦁
              </div>
              <div>
                <span className="bg-white/30 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  Savina Junior Explorer
                </span>
                <h2 className="text-2xl font-black mt-1">Hello, {currentUser.name}!</h2>
                <p className="text-pink-100 text-sm font-medium">
                  Welcome to Kindergarten 2! Tap any card to start listening.
                </p>
              </div>
            </div>

            {/* Streak & Star Counter */}
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30">
              <div className="text-center">
                <div className="flex items-center justify-center text-amber-300 text-lg font-black gap-1">
                  <Flame className="w-5 h-5 fill-amber-300 text-amber-300" /> {currentUser.streakDays}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider">Day Streak</div>
              </div>
              <div className="w-px h-8 bg-white/30" />
              <div className="text-center">
                <div className="flex items-center justify-center text-yellow-300 text-lg font-black gap-1">
                  <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" /> {currentUser.points}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider">Stars</div>
              </div>
            </div>
          </div>
        </div>

        {/* Read-Aloud Voice Helper Button */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                speakText(
                  `Welcome Blessing! Tap the big cards below to listen to Henry the Hippo story or play number fun games!`
                )
              }
              className="w-12 h-12 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-lg transition animate-pulse"
              title="Click to Read Aloud"
            >
              <Volume2 className="w-6 h-6" />
            </button>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Audio Read-Aloud Voice</span>
                <span className="text-[10px] bg-pink-950 text-pink-300 border border-pink-700 px-2 py-0.5 rounded-full font-bold">
                  Tap To Hear
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Touch any text or button to listen with your speakers!
              </p>
            </div>
          </div>
        </div>

        {/* Kid Navigation Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => {
              setActiveTab('student_dashboard');
              setActiveLesson(studentLessons[0]);
            }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 hover:scale-105 transition rounded-2xl p-4 text-white text-center shadow-lg flex flex-col items-center gap-2"
          >
            <span className="text-3xl">📖</span>
            <span className="font-black text-sm">Story Time</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('student_assignments');
              if (studentAssignments[0]) {
                setActiveQuiz(studentAssignments[0]);
                setSelectedAnswers({});
                setQuizSubmitted(false);
              }
            }}
            className="bg-gradient-to-br from-emerald-600 to-teal-700 hover:scale-105 transition rounded-2xl p-4 text-white text-center shadow-lg flex flex-col items-center gap-2"
          >
            <span className="text-3xl">⭐</span>
            <span className="font-black text-sm">Fun Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('student_badges')}
            className="bg-gradient-to-br from-amber-500 to-orange-600 hover:scale-105 transition rounded-2xl p-4 text-white text-center shadow-lg flex flex-col items-center gap-2"
          >
            <span className="text-3xl">🏆</span>
            <span className="font-black text-sm">My Badges</span>
          </button>

          <button
            onClick={() => setActiveTab('student_grades')}
            className="bg-gradient-to-br from-pink-600 to-purple-700 hover:scale-105 transition rounded-2xl p-4 text-white text-center shadow-lg flex flex-col items-center gap-2"
          >
            <span className="text-3xl">📜</span>
            <span className="font-black text-sm">Report Card</span>
          </button>
        </div>

        {/* Active Kid Content Area */}
        {activeTab === 'student_dashboard' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>🦛</span> Letter Sounds & Story Time
              </h3>
              <button
                onClick={() =>
                  speakText(
                    studentLessons[0]?.readAloudText ||
                      'Hello friends! Letter H makes the sound ha ha ha like Happy Hippo!'
                  )
                }
                className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition"
              >
                <Volume2 className="w-4 h-4" /> Read Story Aloud
              </button>
            </div>

            {/* Story Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-6xl inline-block animate-pulse">🦛</span>
                <h4 className="text-xl font-black text-amber-300">
                  {studentLessons[0]?.title}
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed font-medium bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
                  "{studentLessons[0]?.readAloudText}"
                </p>
              </div>

              {/* Phonics Interactive Buttons */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => speakText('Letter H! H is for Hippo! /h/ /h/ Hippo!')}
                  className="bg-emerald-600 hover:bg-emerald-500 p-3 rounded-xl text-white font-black text-center shadow transition"
                >
                  <div className="text-2xl">🦛</div>
                  <div className="text-xs mt-1">H - Hippo</div>
                </button>

                <button
                  onClick={() => speakText('Letter S! S is for Saint Paul River! /s/ /s/ Saint Paul River!')}
                  className="bg-blue-600 hover:bg-blue-500 p-3 rounded-xl text-white font-black text-center shadow transition"
                >
                  <div className="text-2xl">🌊</div>
                  <div className="text-xs mt-1">S - River</div>
                </button>

                <button
                  onClick={() => speakText('Letter P! P is for Palm Tree in Liberia! /p/ /p/ Palm Tree!')}
                  className="bg-amber-600 hover:bg-amber-500 p-3 rounded-xl text-white font-black text-center shadow transition"
                >
                  <div className="text-2xl">🌴</div>
                  <div className="text-xs mt-1">P - Palm Tree</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kid Quizzes */}
        {activeTab === 'student_assignments' && activeQuiz && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>⭐</span> {activeQuiz.title}
              </h3>
              <button
                onClick={() =>
                  speakText(
                    'Touch the right answer to earn shiny stars for your badge collection!'
                  )
                }
                className="flex items-center gap-1.5 bg-pink-600 text-white font-bold px-3 py-1 rounded-xl text-xs"
              >
                <Volume2 className="w-4 h-4" /> Listen
              </button>
            </div>

            <div className="space-y-6">
              {activeQuiz.questions?.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-base">
                      Question {idx + 1}: {q.questionText}
                    </h4>
                    <button
                      onClick={() => speakText(q.questionText)}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options?.map((opt, oIndex) => {
                      const isSelected = selectedAnswers[q.id] === oIndex;
                      return (
                        <button
                          key={oIndex}
                          disabled={quizSubmitted}
                          onClick={() => {
                            setSelectedAnswers((prev) => ({ ...prev, [q.id]: oIndex }));
                            speakText(opt);
                          }}
                          className={`p-4 rounded-2xl text-base font-bold text-left transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-lg'
                              : 'bg-slate-900/90 text-slate-200 border border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-lg rounded-2xl shadow-xl transition"
                >
                  Submit & Collect Stars! ✨
                </button>
              ) : (
                <div className="p-5 bg-emerald-950 border border-emerald-500/60 rounded-2xl text-center space-y-2">
                  <div className="text-3xl">🎉</div>
                  <div className="text-lg font-black text-emerald-300">
                    Terrific Job Blessing!
                  </div>
                  <p className="text-xs text-slate-300">
                    You earned {quizScore} out of {activeQuiz.totalPoints} points!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Kid Badges Shelf */}
        {activeTab === 'student_badges' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>🏆</span> My Achievement Badges
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currentUser.badges?.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 text-center space-y-2"
                >
                  <div className="text-4xl">{b.icon}</div>
                  <h4 className="font-bold text-white text-sm">{b.title}</h4>
                  <p className="text-xs text-slate-400">{b.description}</p>
                  <span className="inline-block text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700">
                    Unlocked: {b.unlockedAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kid Report Card & Visual Analytics */}
        {activeTab === 'student_grades' && (
          <div className="space-y-6">
            <StudentAcademicVisualizer
              reportCard={studentReport}
              student={currentUser}
            />

            {studentReport && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>📜</span> My Kindergarten Report Card
                  </h3>
                  <span className="text-xs bg-emerald-500 text-slate-950 font-black px-3 py-1 rounded-full">
                    Rank: 1st in Class
                  </span>
                </div>

                <div className="space-y-2">
                  {studentReport.subjects.map((sub, i) => (
                    <div
                      key={i}
                      className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between"
                    >
                      <span className="font-bold text-white text-sm">{sub.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold font-mono">{sub.totalScore}%</span>
                        <span className="bg-emerald-600 text-white font-black text-xs px-2 py-0.5 rounded">
                          {sub.letterGrade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* =========================================================================
     SENIOR HIGH & WASSCE MODE (Grade 4 - 12)
     ========================================================================= */
  return (
    <div className="space-y-6">
      {/* High School Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {currentUser.gradeLevel}
            </span>
            <span className="text-xs text-slate-400">
              Section: {currentUser.section || 'Science Stream 10-A'}
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white">
            Welcome, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            WASSCE examination syllabus notes, past papers, and offline-accessible lessons.
          </p>
        </div>

        {/* Sub-nav tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('student_dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'student_dashboard'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Curriculum Courses
          </button>
          <button
            onClick={() => setActiveTab('student_assignments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'student_assignments'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            WASSCE Quizzes ({studentAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab('student_offline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'student_offline'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📥 Offline Downloads
          </button>
          <button
            onClick={() => setActiveTab('student_grades')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'student_grades'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Academic Growth & Transcripts</span>
          </button>
        </div>
      </div>

      {/* Gemini AI Study Companion Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Gemini AI Study Companion</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                24/7 Voice & Homework Tutor
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Practice oral reading with Live Voice API, search WASSCE past exam solutions, or generate science diagrams.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => openAiSuite('voice')}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-950/40"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Live Voice Tutor</span>
          </button>
          <button
            onClick={() => openAiSuite('chat')}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            💬 STEM Chat
          </button>
          <button
            onClick={() => openAiSuite('search')}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            🔍 WASSCE Search
          </button>
          <button
            onClick={() => openAiSuite('music')}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            🎵 Lyria Rhymes
          </button>
        </div>
      </div>

      {/* TAB 1: High School Courses & Lesson Viewer */}
      {activeTab === 'student_dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lessons List Drawer */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Class Lessons ({studentLessons.length})</span>
              <span className="text-[11px] text-slate-400">Liberia MoE Aligned</span>
            </h3>

            <div className="space-y-3">
              {studentLessons.map((l) => {
                const isSelected = activeLesson?.id === l.id;
                return (
                  <div
                    key={l.id}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/40'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                    onClick={() => {
                      setActiveLesson(l);
                      setActiveSlideIndex(0);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] bg-slate-800 text-emerald-300 px-2 py-0.5 rounded font-mono font-semibold uppercase">
                          {l.subject}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-1">{l.title}</h4>
                      </div>
                      <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800 font-mono shrink-0">
                        {l.estimatedDataKb} KB
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{l.description}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800">
                      <span>{l.slides.length} Slides</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDownloadLessonOffline(l.id);
                        }}
                        className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded ${
                          l.isDownloadedOffline
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Download className="w-3 h-3" />
                        {l.isDownloadedOffline ? 'Saved Offline' : 'Download (350KB)'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Lesson Interactive Viewer */}
          <div className="lg:col-span-7">
            {activeLesson ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                {/* Low-Bandwidth Mode Selector */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-bold text-white text-base">{activeLesson.title}</h3>
                    <span className="text-xs text-emerald-400">{activeLesson.subject}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setMediaMode('slides_audio')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
                        mediaMode === 'slides_audio'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" /> Audio + Slides (350 KB)
                    </button>
                    <button
                      onClick={() => setMediaMode('video')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
                        mediaMode === 'video'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" /> Video (48 MB)
                    </button>
                  </div>
                </div>

                {/* Slides & Audio Player View */}
                {mediaMode === 'slides_audio' ? (
                  <div className="space-y-4">
                    {/* Active Slide Card */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 min-h-[220px] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span>
                            Slide {activeSlideIndex + 1} of {activeLesson.slides.length}
                          </span>
                          <span className="text-emerald-400 font-medium">Low-Bandwidth Mode</span>
                        </div>
                        <h4 className="text-base font-bold text-white">
                          {activeLesson.slides[activeSlideIndex]?.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {activeLesson.slides[activeSlideIndex]?.content}
                        </p>

                        {activeLesson.slides[activeSlideIndex]?.bulletPoints && (
                          <ul className="mt-3 space-y-1 text-xs text-slate-300 list-disc list-inside">
                            {activeLesson.slides[activeSlideIndex].bulletPoints?.map((bp, i) => (
                              <li key={i}>{bp}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Slide Pager Buttons */}
                      <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                        <button
                          disabled={activeSlideIndex === 0}
                          onClick={() => setActiveSlideIndex((idx) => Math.max(0, idx - 1))}
                          className="px-3 py-1 bg-slate-800 disabled:opacity-40 text-xs text-slate-300 rounded hover:bg-slate-700"
                        >
                          Previous Slide
                        </button>
                        <button
                          disabled={activeSlideIndex >= activeLesson.slides.length - 1}
                          onClick={() =>
                            setActiveSlideIndex((idx) =>
                              Math.min(activeLesson.slides.length - 1, idx + 1)
                            )
                          }
                          className="px-3 py-1 bg-emerald-600 disabled:opacity-40 text-xs text-white rounded font-medium hover:bg-emerald-500"
                        >
                          Next Slide
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-3">
                    <Video className="w-12 h-12 text-blue-400 mx-auto" />
                    <h4 className="font-bold text-white text-sm">
                      Video Lecture Stream (48 MB)
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      High-bandwidth video streaming is active. On slow connections, switch back to 'Audio + Slides' to save 99% data.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
                <h4 className="text-sm font-semibold text-white">Select a lesson to begin</h4>
                <p className="text-xs">
                  Read syllabus notes, listen to lectures, or download for offline access.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WASSCE Past Question Quizzes */}
      {activeTab === 'student_assignments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">
              WASSCE Practice Continuous Assessments & Quizzes
            </h3>
            <p className="text-xs text-slate-400">
              Official past paper multiple-choice questions with instant auto-grading.
            </p>
          </div>

          {studentAssignments.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 font-semibold uppercase">
                    {quiz.subject}
                  </span>
                  <h4 className="font-bold text-white text-base mt-1">{quiz.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{quiz.description}</p>
                </div>
                <span className="text-xs font-mono bg-slate-900 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                  {quiz.totalPoints} Marks
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {quiz.questions?.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3"
                  >
                    <h5 className="font-semibold text-white text-xs">
                      {idx + 1}. {q.questionText}
                    </h5>

                    <div className="space-y-1.5">
                      {q.options?.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[q.id] === oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() =>
                              setSelectedAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                            }
                            className={`w-full text-left p-2.5 rounded-lg text-xs transition flex items-center justify-between ${
                              isSelected
                                ? 'bg-emerald-600 text-white font-medium shadow'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setActiveQuiz(quiz);
                  handleSubmitQuiz();
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow transition"
              >
                Submit WASSCE Answers
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Offline Downloads Manager */}
      {activeTab === 'student_offline' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Offline Cached Lessons</h3>
              <p className="text-xs text-slate-400">
                These materials are saved to device storage and can be viewed with zero internet connectivity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons
              .filter((l) => l.isDownloadedOffline)
              .map((l) => (
                <div
                  key={l.id}
                  className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                      {l.subject}
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700">
                      Cached Offline
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{l.title}</h4>
                  <p className="text-xs text-slate-300 line-clamp-2">{l.description}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: Student Report Card & Visual Analytics */}
      {activeTab === 'student_grades' && (
        <div className="space-y-6">
          {/* Recharts MoE Benchmark & Academic Visualizer */}
          <StudentAcademicVisualizer
            reportCard={studentReport}
            student={currentUser}
          />

          {studentReport && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Official Term Report Card — {studentReport.termName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Overall Average: <strong className="text-emerald-400">{studentReport.overallAverage}%</strong> • Class Position: <strong className="text-white">{studentReport.classPosition} of {studentReport.totalStudentsInClass}</strong>
                  </p>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40 font-bold">
                  WAEC Distinction Standing
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Subject Name</th>
                      <th className="p-3">CA (40%)</th>
                      <th className="p-3">Exam (60%)</th>
                      <th className="p-3">Total /100</th>
                      <th className="p-3">Letter Grade</th>
                      <th className="p-3">WAEC Standard Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {studentReport.subjects.map((sub, i) => (
                      <tr key={i} className="hover:bg-slate-800/60 transition">
                        <td className="p-3 font-semibold text-white">{sub.name}</td>
                        <td className="p-3 text-slate-300 font-mono">{sub.caScore} / 40</td>
                        <td className="p-3 text-slate-300 font-mono">{sub.examScore} / 60</td>
                        <td className="p-3 font-bold text-emerald-400 font-mono">{sub.totalScore}%</td>
                        <td className="p-3">
                          <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-black border border-emerald-500/40">
                            {sub.letterGrade}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{sub.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
