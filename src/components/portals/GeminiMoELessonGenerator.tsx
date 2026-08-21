import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Download,
  Copy,
  Layers,
  Wand2,
  HelpCircle,
  Clock,
  Target,
  FileText,
  Bookmark,
  Share2,
  ChevronRight,
  Printer,
  Compass,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { saveAIGenerationRecord } from '../../firebase';

export interface MoELessonPlan {
  lessonTitle: string;
  gradeLevel: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  learningObjectives: string[];
  materialsNeeded: string[];
  introductionHook: string;
  coreConceptExplanation: string;
  workedExamples: { problem: string; stepByStepSolution: string }[];
  differentiatedActivities: {
    support: string;
    extension: string;
  };
  readAloudSummary: string;
  quickCheckQuiz: {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }[];
}

export const GeminiMoELessonGenerator: React.FC = () => {
  const { currentUser, currentSchool, addLesson } = useApp();

  // Generator input states
  const [subject, setSubject] = useState(currentUser.teachingSubjects?.[0] || 'General Science');
  const [gradeLevel, setGradeLevel] = useState('Grade 10 (Senior High)');
  const [topic, setTopic] = useState('Photosynthesis & Plant Respiration');
  const [studentTier, setStudentTier] = useState<'standard' | 'early_childhood' | 'wassce_prep'>('standard');
  const [localContext, setLocalContext] = useState(
    'Incorporate Liberian agriculture (cassava & rubber cultivation in Margibi/Nimba) and tropical rainforest ecosystem.'
  );

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<MoELessonPlan | null>(null);
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);

  // MoE Subject options
  const subjects = [
    'General Science',
    'Biology',
    'Chemistry',
    'Physics',
    'Mathematics / WAEC Core',
    'English Language & Composition',
    'Social Studies & Liberian History',
    'Geography of West Africa',
    'Civics & National Governance',
    'Agriculture & Food Security',
    'Computer Literacy & Technology',
    'Early Childhood Phonics & Literacy',
    'Early Childhood Numeracy',
  ];

  const gradeLevels = [
    'K1 (Nursery / Early Childhood)',
    'K2 (Kindergarten)',
    'Grade 1 (Lower Basic)',
    'Grade 2 (Lower Basic)',
    'Grade 3 (Lower Basic)',
    'Grade 4 (Upper Basic)',
    'Grade 5 (Upper Basic)',
    'Grade 6 (Upper Basic)',
    'Grade 7 (Junior High)',
    'Grade 8 (Junior High)',
    'Grade 9 (Junior High / WAEC BECE Prep)',
    'Grade 10 (Senior High)',
    'Grade 11 (Senior High)',
    'Grade 12 (Senior High / WASSCE Exam Focus)',
  ];

  const quickPresets = [
    {
      subject: 'Mathematics / WAEC Core',
      grade: 'Grade 12 (Senior High / WASSCE Exam Focus)',
      topic: 'Trigonometric Identities & Sine/Cosine Rules',
      tier: 'wassce_prep' as const,
      context: 'Focus on WASSCE past exam question patterns and step-by-step angle of elevation word problems.',
    },
    {
      subject: 'Social Studies & Liberian History',
      grade: 'Grade 9 (Junior High / WAEC BECE Prep)',
      topic: 'The Declaration of Independence (1847) & Governance in Liberia',
      tier: 'standard' as const,
      context: 'Compare historical governance with contemporary county administration across the 15 counties.',
    },
    {
      subject: 'General Science',
      grade: 'Grade 8 (Junior High)',
      topic: 'Water Purification & Sanitation in West African Communities',
      tier: 'standard' as const,
      context: 'Highlight filtration techniques using local sand, gravel, and boiling for clean drinking water.',
    },
    {
      subject: 'Early Childhood Phonics & Literacy',
      grade: 'K2 (Kindergarten)',
      topic: 'Letter Sound Blends: /sh/, /ch/, /th/ with Storytelling',
      tier: 'early_childhood' as const,
      context: 'Incorporate cheerful call-and-response songs with local animal characters and fruits (pawpaw, mango).',
    },
  ];

  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setPublished(false);

    try {
      const res = await fetch('/api/ai/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          gradeLevel,
          studentTier,
          context: localContext,
        }),
      });

      const data = await res.json();
      if (data.lessonPlan) {
        setGeneratedPlan(data.lessonPlan);

        // Save AI generation to Firestore
        await saveAIGenerationRecord({
          type: 'lesson_plan',
          userId: currentUser.id,
          prompt: `[MoE Lesson Plan] ${gradeLevel} - ${subject}: ${topic}`,
          output: JSON.stringify(data.lessonPlan),
        });
      } else {
        setErrorMsg('Failed to generate lesson plan structure. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Network error while connecting to Gemini MoE Curriculum Engine.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToClass = () => {
    if (!generatedPlan) return;

    // Convert MoE lesson structure to app lesson note
    addLesson({
      title: generatedPlan.lessonTitle,
      subject: generatedPlan.subject,
      gradeLevel: generatedPlan.gradeLevel,
      description: `${generatedPlan.readAloudSummary}\n\nObjectives:\n${generatedPlan.learningObjectives.join('\n')}`,
      schoolId: currentSchool.id,
      estimatedDataKb: 18, // Ultra-low bandwidth payload
      slides: [
        {
          slideNumber: 1,
          heading: 'Learning Objectives & Key Terms',
          content: generatedPlan.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n\n'),
          audioScript: generatedPlan.readAloudSummary,
        },
        {
          slideNumber: 2,
          heading: 'Introduction & Warm-Up Hook',
          content: generatedPlan.introductionHook,
          audioScript: 'Let us start with this engaging classroom hook before diving into the core formula.',
        },
        {
          slideNumber: 3,
          heading: 'Core Concept Breakdown',
          content: generatedPlan.coreConceptExplanation,
          audioScript: 'Take note of this essential explanation in your exercise notebooks.',
        },
        ...(generatedPlan.workedExamples || []).map((ex, idx) => ({
          slideNumber: 4 + idx,
          heading: `Worked Example ${idx + 1}`,
          content: `Problem: ${ex.problem}\n\nStep-by-Step Solution:\n${ex.stepByStepSolution}`,
          audioScript: `Let us work through Example ${idx + 1} together step-by-step.`,
        })),
        {
          slideNumber: (generatedPlan.workedExamples?.length || 0) + 4,
          heading: 'Quick Check Formative Assessment',
          content: (generatedPlan.quickCheckQuiz || [])
            .map(
              (q, i) =>
                `Q${i + 1}: ${q.question}\nOptions:\n${q.options.join('\n')}\n*Correct: ${q.options[q.correctAnswerIndex]}*`
            )
            .join('\n\n'),
          audioScript: 'Answer these quick check questions to verify your understanding before the period ends.',
        },
      ],
    });

    setPublished(true);
  };

  const handleCopyText = () => {
    if (!generatedPlan) return;
    const formatted = `
=========================================
REPUBLIC OF LIBERIA - MINISTRY OF EDUCATION (MoE)
CURRICULUM COMPLIANT LESSON PLAN
=========================================
TITLE: ${generatedPlan.lessonTitle}
SUBJECT: ${generatedPlan.subject}
GRADE LEVEL: ${generatedPlan.gradeLevel}
ESTIMATED DURATION: ${generatedPlan.durationMinutes} Minutes

LEARNING OBJECTIVES:
${generatedPlan.learningObjectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}

MATERIALS & TEACHING AIDS:
${generatedPlan.materialsNeeded.map((m) => `• ${m}`).join('\n')}

1. INTRODUCTION & HOOK (5-8 Mins):
${generatedPlan.introductionHook}

2. CORE CONCEPT & PEDAGOGICAL EXPLANATION:
${generatedPlan.coreConceptExplanation}

3. WORKED EXAMPLES:
${(generatedPlan.workedExamples || [])
  .map((ex, i) => `Example ${i + 1}: ${ex.problem}\nSolution:\n${ex.stepByStepSolution}`)
  .join('\n\n')}

4. DIFFERENTIATED INSTRUCTION:
• Support/Scaffold: ${generatedPlan.differentiatedActivities?.support}
• Extension/Enrichment: ${generatedPlan.differentiatedActivities?.extension}

5. SUMMARY & EXIT TICKET:
${generatedPlan.readAloudSummary}

6. FORMATIVE QUIZ QUESTIONS:
${(generatedPlan.quickCheckQuiz || [])
  .map(
    (q, i) =>
      `Q${i + 1}: ${q.question}\n${q.options.map((opt, oi) => `   [${String.fromCharCode(65 + oi)}] ${opt}`).join('\n')}\nAnswer: Option ${String.fromCharCode(65 + q.correctAnswerIndex)} - ${q.explanation}`
  )
  .join('\n\n')}
=========================================
Generated by Savina AI with Gemini 3.7 Flash
Liberian MoE Standards Compliant
=========================================
`.trim();

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Gemini AI <span className="text-emerald-400">MoE Lesson Plan Generator</span>
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  Liberia MoE & WASSCE Compliant
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Generates fully structured, 45-minute national curriculum lesson plans with local West African examples, low-bandwidth slides, and WAEC-aligned formative assessments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Powered by</span>
            <span className="bg-slate-950 text-emerald-300 font-mono px-3 py-1 rounded-xl border border-slate-800 font-bold">
              gemini-3.7-flash
            </span>
          </div>
        </div>
      </div>

      {/* Generator Configuration Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Curriculum Parameters & Lesson Topic
          </h4>
          <span className="text-xs text-slate-400">All 15 Liberian Counties Supported</span>
        </div>

        <form onSubmit={handleGeneratePlan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                MoE Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Level Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Grade / Class Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {gradeLevels.map((gr) => (
                  <option key={gr} value={gr}>
                    {gr}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Tier / Focus */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pedagogical Tier
              </label>
              <select
                value={studentTier}
                onChange={(e: any) => setStudentTier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="standard">Standard MoE Classroom</option>
                <option value="wassce_prep">WASSCE Exam Intensive Prep</option>
                <option value="early_childhood">Early Childhood / Play-Based</option>
              </select>
            </div>
          </div>

          {/* Lesson Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Specific Lesson Topic or Syllabus Unit
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Chemical Bonding: Covalent vs Ionic Compounds, or The Liberian Constitution..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Local Context & Liberian Realia */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Local Cultural Context & Liberian Community Realia</span>
              <span className="text-[11px] text-slate-500 font-normal">Optional Customization</span>
            </label>
            <input
              type="text"
              value={localContext}
              onChange={(e) => setLocalContext(e.target.value)}
              placeholder="e.g. Relate to fishing communities in Grand Bassa, market arithmetic in Waterside, or solar energy..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Includes Objectives, 45-Min Schedule, Chalkboard Notes, Differentiated Tasks & Quiz</span>
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating MoE Plan with Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate MoE Lesson Plan</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Presets Carousel */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <span className="text-xs font-semibold text-slate-400 block">
            Suggested Liberian Curriculum Syllabus Modules:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {quickPresets.map((pr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSubject(pr.subject);
                  setGradeLevel(pr.grade);
                  setTopic(pr.topic);
                  setStudentTier(pr.tier);
                  setLocalContext(pr.context);
                }}
                className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-2.5 text-left transition group"
              >
                <span className="text-[10px] font-bold text-emerald-400 block truncate">
                  {pr.subject}
                </span>
                <span className="text-xs font-semibold text-white group-hover:text-emerald-300 block line-clamp-1">
                  {pr.topic}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {pr.grade.split('(')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-rose-950/60 border border-rose-500/40 rounded-2xl p-4 text-xs text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Generated Lesson Plan Display */}
      {generatedPlan && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Official MoE Syllabus Record
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                  {generatedPlan.durationMinutes} Mins
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">{generatedPlan.lessonTitle}</h3>
              <p className="text-xs text-slate-400">
                {generatedPlan.gradeLevel} • {generatedPlan.subject}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopyText}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Full Plan' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={handlePublishToClass}
                disabled={published}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                  published
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                }`}
              >
                {published ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Published to Class Slides</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Publish as Low-Data Lesson Pack</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 1: Learning Objectives & Materials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4" />
                Specific Learning Objectives
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {generatedPlan.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Teaching Materials & Realia
              </h4>
              <div className="flex flex-wrap gap-2">
                {generatedPlan.materialsNeeded.map((mat, i) => (
                  <span
                    key={i}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {mat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Introduction Hook & Core Concept */}
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  1. Introduction & Engaging Warm-Up Hook (5-8 Minutes)
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Step 1</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {generatedPlan.introductionHook}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  2. Core Pedagogical Concept Breakdown (20-25 Minutes)
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Step 2</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {generatedPlan.coreConceptExplanation}
              </div>
            </div>
          </div>

          {/* Section 3: Worked Examples */}
          {generatedPlan.workedExamples && generatedPlan.workedExamples.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" />
                3. Worked Examples & Chalkboard Practice (10 Minutes)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedPlan.workedExamples.map((ex, i) => (
                  <div
                    key={i}
                    className="bg-slate-950 border border-purple-900/40 rounded-2xl p-5 space-y-3"
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="text-purple-400">Example {i + 1}:</span>
                      <span>{ex.problem}</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {ex.stepByStepSolution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Differentiated Instruction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 space-y-2">
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
                Differentiated Support (Scaffold for struggling learners)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {generatedPlan.differentiatedActivities?.support}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 space-y-2">
              <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block">
                Extension / Enrichment (Advanced learners & WASSCE Honors)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {generatedPlan.differentiatedActivities?.extension}
              </p>
            </div>
          </div>

          {/* Section 5: Formative Assessment Quiz & Exit Ticket */}
          <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                4. Formative Assessment Quick-Check Quiz (Exit Ticket)
              </h4>
              <span className="text-xs text-slate-400">Instant Student Feedback</span>
            </div>

            <div className="space-y-4">
              {(generatedPlan.quickCheckQuiz || []).map((q, qIdx) => (
                <div key={qIdx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="text-xs sm:text-sm font-bold text-white flex items-start gap-2">
                    <span className="text-emerald-400 font-mono">Q{qIdx + 1}.</span>
                    <span>{q.question}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correctAnswerIndex;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-lg border transition ${
                            isCorrect
                              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 font-semibold'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="font-mono text-slate-500 mr-1.5">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          {opt}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-[11px] text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-emerald-400">Answer Key: </span>
                    {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
