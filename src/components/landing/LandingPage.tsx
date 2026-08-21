import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  School,
  Wifi,
  WifiOff,
  Signal,
  Smartphone,
  CreditCard,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  Radio,
  DownloadCloud,
  FileText,
  BarChart3,
  Award,
  Globe2,
  Lock,
  ChevronRight,
  MessageSquare,
  Star,
  Layers,
  Server,
  Play,
  Clock,
  PhoneCall,
  Flame,
  UserCheck,
} from 'lucide-react';
import { Currency } from '../../types';

interface LandingPageProps {
  onEnterPortal: (tab?: string) => void;
  onOpenLogin: () => void;
  onOpenSignUp: (mode?: 'school' | 'member') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterPortal,
  onOpenLogin,
  onOpenSignUp,
}) => {
  const { schools, currency, setCurrency, formatMoney, usdToLrdRate } = useApp();

  const [activeFeatureTab, setActiveFeatureTab] = useState<'offline' | 'momo' | 'sms' | 'ai' | 'moe' | 'security'>('offline');
  const [selectedRolePreview, setSelectedRolePreview] = useState<'admin' | 'teacher' | 'student' | 'parent' | 'bursar'>('teacher');
  const [simulatedNetwork, setSimulatedNetwork] = useState<'4g' | '3g' | 'offline'>('3g');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Banner / Announcement */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-indigo-950 border-b border-emerald-800/40 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 animate-pulse">
              <Flame className="w-3 h-3" /> New Release 2026
            </span>
            <span className="text-slate-200">
              Liberia Ministry of Education (MoE) 2025/2026 Curriculum & MTN MoMo/Orange Money Gateway v2.4 Live
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-900/80 rounded border border-slate-700/60 p-0.5">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${
                  currency === 'USD' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                $ USD
              </button>
              <button
                onClick={() => setCurrency('LRD')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${
                  currency === 'LRD' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                L$ LRD
              </button>
            </div>

            <button
              onClick={() => onEnterPortal('admin_overview')}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 text-[11px]"
            >
              <span>Instant Interactive Demo</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Landing Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-950/80 text-white font-black text-2xl">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Savina <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Learning Center</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full font-bold uppercase">
                  Liberia K-12 OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Multi-Tenant Cloud & Low-Bandwidth Offline Campus Engine
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition">Features</a>
            <a href="#low-bandwidth" className="hover:text-emerald-400 transition flex items-center gap-1">
              <span>Low Bandwidth</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">2G/3G</span>
            </a>
            <a href="#momo-gateway" className="hover:text-emerald-400 transition">Mobile Money</a>
            <a href="#portals" className="hover:text-emerald-400 transition">Portals</a>
            <a href="#pricing" className="hover:text-emerald-400 transition">Pricing</a>
            <a href="#faq" className="hover:text-emerald-400 transition">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => onOpenSignUp('school')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-950/60 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Register School</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Background Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs text-emerald-300 shadow-xl shadow-emerald-950/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-semibold">Engineered specifically for Liberian Schools & West African Communities</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
              The Next-Generation K-12 OS for Liberia.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Online, 2G, or 100% Offline.
              </span>
            </h1>

            {/* Sub-Headline */}
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Empower your campus with automated <strong>MTN MoMo & Orange Money</strong> tuition settlement, <strong>Liberia MoE national curriculum</strong> alignment, zero-data <strong>Parent SMS alerts</strong>, and <strong>Gemini 3.7 Flash AI</strong> lesson planning.
            </p>

            {/* CTA Button Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => onEnterPortal('admin_overview')}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-950/70 transition flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Launch Interactive Demo Portal</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => onOpenSignUp('school')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-base transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <School className="w-5 h-5 text-emerald-400" />
                <span>Register Your Institution</span>
              </button>

              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-base transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <span>Sign In / Switch Role</span>
              </button>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-2xl font-black text-white">450+</div>
                <div className="text-xs text-slate-400 mt-0.5">Accredited Schools</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1">Montserrado, Nimba, Margibi</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-2xl font-black text-emerald-400">14.2 MB</div>
                <div className="text-xs text-slate-400 mt-0.5">Data Saved / Student</div>
                <div className="text-[10px] text-emerald-300 font-bold mt-1">Adaptive Low-Bandwidth</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-2xl font-black text-amber-400">100%</div>
                <div className="text-xs text-slate-400 mt-0.5">Liberia MoE Aligned</div>
                <div className="text-[10px] text-amber-300 font-bold mt-1">WASSCE & WAEC Ready</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="text-2xl font-black text-teal-400">MTN & Orange</div>
                <div className="text-xs text-slate-400 mt-0.5">Mobile Money Built-in</div>
                <div className="text-[10px] text-teal-300 font-bold mt-1">Instant USD / LRD Receipts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE NETWORK & LOW-BANDWIDTH DEMO BANNER */}
      <section id="low-bandwidth" className="bg-slate-900 border-y border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase">
                <Zap className="w-3.5 h-3.5" /> High-Performance Offline Engine
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Designed for spotty 2G connections and rural internet blackouts.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Most Western EdTech platforms require 20Mbps fibre optic broadband. <strong>Savina runs flawlessly on 128kbps 2G/3G connections</strong> or completely offline with background SQLite sync when network returns.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-white">Audio + Slides Virtual Classroom (&lt;15 kbps)</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Stream crisp teacher lectures and synchronized whiteboard notes without heavy video streams.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-white">Offline Attendance & Gradebook Sync</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Teachers take morning roll call and record grades in the classroom with zero connectivity; records sync automatically upon network restoration.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-white">Zero-Data Parent SMS Gateway</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Parents receive instant SMS notifications on basic feature phones when their child is marked absent or achieves top marks.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Network Simulator Box */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold">Interactive Simulator</span>
                  <h3 className="text-base font-bold text-white">Live Bandwidth Consumption Test</h3>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setSimulatedNetwork('4g')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      simulatedNetwork === '4g' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    4G Fast
                  </button>
                  <button
                    onClick={() => setSimulatedNetwork('3g')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      simulatedNetwork === '3g' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    2G/3G Liberia
                  </button>
                  <button
                    onClick={() => setSimulatedNetwork('offline')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      simulatedNetwork === 'offline' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Offline
                  </button>
                </div>
              </div>

              {/* Status Graphic */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
                    <div className="text-xs text-slate-400">Classroom Stream Rate</div>
                    <div className="text-xl font-bold text-emerald-400 mt-0.5">
                      {simulatedNetwork === '4g' ? '180 kbps (HD Audio+Slides)' : simulatedNetwork === '3g' ? '12.4 kbps (Adaptive Mode)' : '0 kbps (Cached Local)'}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
                    <div className="text-xs text-slate-400">Hourly Mobile Data Cost</div>
                    <div className="text-xl font-bold text-amber-400 mt-0.5">
                      {simulatedNetwork === '4g' ? '~ $0.05 / hr' : simulatedNetwork === '3g' ? '< $0.01 / hr' : '$0.00 (Zero Data)'}
                    </div>
                  </div>
                </div>

                {/* Simulated Classroom Feed */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-white font-bold">
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      Grade 10 - Mathematics Live Broadcast
                    </span>
                    <span className="text-slate-400">Mr. Tamba Kollie</span>
                  </div>

                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-xs text-emerald-300">
                    <div>[AUDIO STREAM: Active @ 12.4kbps codec]</div>
                    <div>[SLIDE #3: Quadratic Formula Factoring & Proofs]</div>
                    <div>[STATUS: 28 Students connected via MTN Lonestar & Orange]</div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Synchronized across Monrovia, Nimba & Margibi</span>
                    <button
                      onClick={() => onEnterPortal('teacher_live')}
                      className="text-emerald-400 hover:underline font-bold"
                    >
                      Open Live Classroom &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SHOWCASE WITH TABS */}
      <section id="features" className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Comprehensive Institutional Management
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Every tool required to run a premier K-12 Academy in West Africa
            </h2>
            <p className="text-sm text-slate-400">
              Explore how Savina combines administrative governance, academic rigor, and financial automation.
            </p>
          </div>

          {/* Feature Navigation Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { id: 'offline', label: 'Offline-First & Low Data', icon: WifiOff },
              { id: 'momo', label: 'Mobile Money Gateway', icon: Smartphone },
              { id: 'sms', label: 'Parent SMS Alerts', icon: MessageSquare },
              { id: 'moe', label: 'Liberia MoE Curriculum', icon: BookOpen },
              { id: 'ai', label: 'Gemini 3.7 AI Lesson Plans', icon: Sparkles },
              { id: 'security', label: 'PostgreSQL RLS Security', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                    activeFeatureTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-400'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Feature Card Preview Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            {activeFeatureTab === 'offline' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-emerald-400 uppercase">Resilience Without Compromise</span>
                  <h3 className="text-2xl font-bold text-white">Full Classroom Autonomy without Constant Internet</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Savina caches student rosters, curriculum guides, and homework prompts directly in browser storage. Teachers mark attendance and record continuous assessments offline. When 3G connection returns, data synchronizes smoothly without duplication.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Automatic conflict resolution on batch roster updates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Download entire term textbooks and PDF lesson packs for offline review</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => onEnterPortal('teacher_attendance')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2"
                  >
                    <span>Test Offline Attendance Roster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs text-slate-300">
                  <div className="text-emerald-400 font-bold border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span>// SAVINA OFFLINE SYNC PIPELINE</span>
                    <span className="text-[10px] text-amber-300">LOCAL QUEUE ACTIVE</span>
                  </div>
                  <div>1. Teacher enters 36 Grade 10 Math quiz scores</div>
                  <div>2. Network status: [OFFLINE] &rarr; Stored in local encrypted queue</div>
                  <div>3. Network ping: [RESTORED 4G] &rarr; POST /api/attendance/batch</div>
                  <div className="text-emerald-400">4. Server status: HTTP 201 Created (0 data collisions)</div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'momo' && (
              <div id="momo-gateway" className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-amber-400 uppercase">Dual-Currency Financial Ledger</span>
                  <h3 className="text-2xl font-bold text-white">MTN Mobile Money & Orange Money Automated Collections</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Say goodbye to handling thick stacks of cash at the bursar's window. Parents pay tuition instantly via <strong>*156# MTN MoMo</strong> or <strong>*144# Orange Money</strong> in either USD or Liberian Dollars (LRD).
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Instant SMS receipt codes generated directly to the parent's phone</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Real-time reconciliation of outstanding balances with live market FX rate</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => onEnterPortal('bursar_invoices')}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center gap-2"
                  >
                    <span>View Bursar MoMo Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
                    <span className="text-white">Sample Tuition Invoice (Term 1)</span>
                    <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">USD 160 / LRD 31,680</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Tuition & Instructional Fee</span>
                      <span>$120.00</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Science Lab & Computer Materials</span>
                      <span>$25.00</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>MoE Exam Assessment Levy</span>
                      <span>$15.00</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Payment Channel:</span>
                    <span className="text-amber-300 font-bold">MTN MoMo (+231 77 900 1122)</span>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'sms' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-emerald-400 uppercase">100% Phone Compatibility</span>
                  <h3 className="text-2xl font-bold text-white">Guardian SMS Gateway for Basic Feature Phones</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Most Liberian guardians use standard basic feature phones (Nokia/Itel). Savina transmits crucial academic updates, unexcused absences, and fee reminders via standard GSM SMS gateways with 99.8% delivery guarantees.
                  </p>
                  <button
                    onClick={() => onEnterPortal('admin_sms')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2"
                  >
                    <span>Open SMS Dispatcher</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>FROM: SAVINA-SMS</span>
                      <span>08:45 AM</span>
                    </div>
                    <p className="text-slate-200">
                      "Dear Parent, Fatu Sherif was marked PRESENT for Grade 10 Math today at Savina Learning Center. Class average: 88%."
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>FROM: SAVINA-SMS</span>
                      <span>Yesterday</span>
                    </div>
                    <p className="text-slate-200">
                      "Payment Received: $60.00 (LRD 11,880) via Orange Money Ref OM-LR-55829104 for Korvah Kamara. Balance: $55.00."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'moe' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-amber-400 uppercase">National Curriculum Standards</span>
                  <h3 className="text-2xl font-bold text-white">Republic of Liberia MoE & WASSCE Repository</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Pre-loaded with official Liberian Ministry of Education learning competencies for Early Childhood, Basic Education, and Senior High School. Teachers plan with syllabus-approved competencies and export one-click MoE compliance inspection audits.
                  </p>
                  <button
                    onClick={() => onEnterPortal('moe_library')}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center gap-2"
                  >
                    <span>Browse MoE Digital Library</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="font-bold text-white">Grade 10 Mathematics: Real Numbers & Polynomials</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Code: MOE-MTH-G10-U1 • 24 Recommended Hours</div>
                    <div className="text-amber-300 text-[10px] mt-1 font-semibold">WASSCE Exam Weight: 35% Core Track</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="font-bold text-white">K2 Phonics Foundations: Auditory Discrimination</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Code: MOE-ECE-K2-U1 • Early Childhood Division</div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'ai' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-indigo-400 uppercase">Gemini 3.7 Flash Integration</span>
                  <h3 className="text-2xl font-bold text-white">Culturally Contextualized AI Lesson Designer</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Generate comprehensive 45-minute lesson plans, worked examples, differentiated activities, and WASSCE quizzes incorporating authentic Liberian examples (e.g. Monrovia markets, Nimba highlands, local agriculture).
                  </p>
                  <button
                    onClick={() => onEnterPortal('teacher_lessons')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-2"
                  >
                    <span>Launch AI Lesson Planner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2 text-xs font-mono">
                  <div className="text-emerald-400 font-bold">// AI-GENERATED WORKED EXAMPLE:</div>
                  <div className="text-slate-300">
                    "A market trader in Waterside Market sells bags of rice (x) and gallons of palm oil (y). If 2x + 3y = $45 and 4x + y = $40, calculate unit costs."
                  </div>
                  <div className="text-teal-300 mt-2">
                    &rarr; Step 1: Multiply eq(2) by 3: 12x + 3y = $120
                    <br />
                    &rarr; Step 2: Subtract: 10x = $75 &rarr; x = $7.50 / bag
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'security' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-purple-400 uppercase">Cryptographic Tenant Partitioning</span>
                  <h3 className="text-2xl font-bold text-white">PostgreSQL Row-Level Security & FERPA Compliance</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Student educational records, medical conditions, and financial statements are safeguarded by cryptographic tenant boundaries. A teacher in School A can never query records from School B, and parents can only inspect their own verified dependents.
                  </p>
                  <button
                    onClick={() => onEnterPortal('db_security')}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-2"
                  >
                    <span>Explore PostgreSQL Security Engine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2 font-mono text-xs text-indigo-300">
                  <div>CREATE POLICY tenant_isolation_policy ON grades</div>
                  <div>USING (school_id = current_setting('app.current_school_id')::uuid</div>
                  <div>AND (</div>
                  <div className="pl-4">current_user_role() IN ('school_admin', 'platform_admin')</div>
                  <div className="pl-4">OR (current_user_role() = 'teacher' AND teacher_id = current_user_id())</div>
                  <div className="pl-4">OR (current_user_role() = 'student' AND student_id = current_user_id())</div>
                  <div>));</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ROLE-TAILORED PORTALS EXPLORER */}
      <section id="portals" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              Tailored Portals for Every Stakeholder
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              One unified platform, six purpose-built experiences
            </h2>
            <p className="text-sm text-slate-400">
              Select any role below to preview their custom interface and workflow.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-3xl mx-auto">
            {[
              { id: 'admin', label: 'School Admin', icon: '🏛️' },
              { id: 'teacher', label: 'Teachers', icon: '👩‍🏫' },
              { id: 'student', label: 'Students', icon: '🎓' },
              { id: 'parent', label: 'Parents', icon: '👨‍👧' },
              { id: 'bursar', label: 'Bursars', icon: '💰' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedRolePreview(item.id as any)}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                  selectedRolePreview === item.id
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-bold">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Role Detail Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 max-w-4xl mx-auto">
            {selectedRolePreview === 'admin' && (
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white">Proprietor & School Administrator Command Center</h4>
                <p className="text-sm text-slate-300">
                  Manage academic terms, staff assignments, automated SMS broadcasts to all guardians, and generate official Liberia Ministry of Education annual inspection compliance reports.
                </p>
                <button
                  onClick={() => onEnterPortal('admin_overview')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2"
                >
                  <span>Launch School Admin Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {selectedRolePreview === 'teacher' && (
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white">Educator Workbench & AI Lesson Studio</h4>
                <p className="text-sm text-slate-300">
                  Take daily roll call in seconds, compute weighted continuous assessment grades, broadcast low-bandwidth live virtual classes, and generate curriculum-aligned lesson modules using Gemini 3.7.
                </p>
                <button
                  onClick={() => onEnterPortal('teacher_attendance')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2"
                >
                  <span>Launch Teacher Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {selectedRolePreview === 'student' && (
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white">Adaptive Student Learning Hub</h4>
                <p className="text-sm text-slate-300">
                  Featuring dual modes: an engaging, big-button gamified experience for <strong>K-2 Early Childhood learners</strong> (Phonics & Numeracy), and a rigorous academic portal with <strong>WASSCE test prep</strong> and downloadable offline lesson materials for High School scholars.
                </p>
                <button
                  onClick={() => onEnterPortal('student_dashboard')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2"
                >
                  <span>Launch Student Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {selectedRolePreview === 'parent' && (
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white">Parent & Guardian Transparent Portal</h4>
                <p className="text-sm text-slate-300">
                  Track multiple children across different grade levels, view daily attendance timestamps, check term report cards, and settle school tuition with one-click <strong>MTN MoMo or Orange Money</strong> checkout.
                </p>
                <button
                  onClick={() => onEnterPortal('parent_overview')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2"
                >
                  <span>Launch Parent Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {selectedRolePreview === 'bursar' && (
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white">Bursar Financial & Tuition Ledger</h4>
                <p className="text-sm text-slate-300">
                  Generate bulk term fee invoices, track real-time Mobile Money settlements in USD and LRD, reconcile cash payments, and disburse official electronic receipts with tamper-proof reference numbers.
                </p>
                <button
                  onClick={() => onEnterPortal('bursar_invoices')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2"
                >
                  <span>Launch Bursar Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DUAL CURRENCY PRICING SECTION */}
      <section id="pricing" className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Transparent Dual-Currency Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Accessible pricing for community schools and elite academies
            </h2>
            <p className="text-sm text-slate-400">
              Pay in either United States Dollars (USD) or Liberian Dollars (LRD) via MTN MoMo, Orange Money, or Bank Wire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Community Free */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold text-emerald-400 uppercase">Community Initiative</div>
                <h3 className="text-xl font-bold text-white">Free Forever</h3>
                <div className="text-3xl font-black text-white">
                  {currency === 'USD' ? '$0' : 'L$ 0'}
                  <span className="text-xs font-normal text-slate-400"> / month</span>
                </div>
                <p className="text-xs text-slate-400">
                  Ideal for small community learning centers and mission schools getting started with digital records.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Up to 100 Enrolled Students</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Offline Attendance & Gradebook</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>MoE Syllabus Competency Library</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Basic SMS Absence Alerts</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onOpenSignUp('school')}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                Register Community School Free
              </button>
            </div>

            {/* Standard Academy (POPULAR) */}
            <div className="bg-gradient-to-b from-emerald-950/60 to-slate-900 border-2 border-emerald-500/80 rounded-3xl p-6 space-y-6 flex flex-col justify-between relative shadow-2xl shadow-emerald-950/50">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow">
                Most Popular in Liberia
              </div>

              <div className="space-y-4">
                <div className="text-xs font-bold text-emerald-400 uppercase">Standard Academy</div>
                <h3 className="text-xl font-bold text-white">Full Campus OS</h3>
                <div className="text-3xl font-black text-white">
                  {currency === 'USD' ? '$49' : `L$ ${(49 * usdToLrdRate).toLocaleString()}`}
                  <span className="text-xs font-normal text-slate-400"> / month</span>
                </div>
                <p className="text-xs text-slate-300">
                  Everything required to automate attendance, mobile money fees, and classroom operations.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-200 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Up to 600 Enrolled Students</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>MTN MoMo & Orange Money Auto-Settlement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Gemini 3.7 AI Lesson Plan Generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Audio+Slides Live Virtual Classroom</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Official MoE Inspection Audit Exports</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onOpenSignUp('school')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg transition"
              >
                Start 30-Day Free Trial
              </button>
            </div>

            {/* Enterprise Multi-Campus */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold text-teal-400 uppercase">Enterprise Network</div>
                <h3 className="text-xl font-bold text-white">Multi-Campus</h3>
                <div className="text-3xl font-black text-white">
                  {currency === 'USD' ? '$129' : `L$ ${(129 * usdToLrdRate).toLocaleString()}`}
                  <span className="text-xs font-normal text-slate-400"> / month</span>
                </div>
                <p className="text-xs text-slate-400">
                  For large school networks, diocesan education boards, and multi-campus institutions.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Unlimited Students & Campuses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Dedicated MoMo Sub-Merchant Accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Custom School Subdomain & Branding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>24/7 Dedicated Support in Monrovia</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onOpenSignUp('school')}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                Contact Enterprise Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Trusted by Educators Across Liberia
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Transforming classroom governance from Sinkor to Sanniquellie
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Our tuition collection rate jumped from 62% to 94% in our very first term after parents started paying via MTN MoMo and Orange Money directly from their phones."
              </p>
              <div>
                <div className="text-xs font-bold text-white">Dr. Marie Coleman-Togba</div>
                <div className="text-[11px] text-slate-400">Principal, Savina Learning Center (Monrovia)</div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Taking roll call offline on my tablet and having SMS alerts automatically sent to parents has virtually eliminated unexplained student absences in Senior High."
              </p>
              <div>
                <div className="text-xs font-bold text-white">Mr. Tamba Kollie</div>
                <div className="text-[11px] text-slate-400">Senior Mathematics Master (Margibi County)</div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "As a parent with two kids in school, I no longer lose work hours standing in bank queues. I get immediate SMS receipts on my phone when tuition is settled."
              </p>
              <div>
                <div className="text-xs font-bold text-white">Madam Kebbeh Kamara</div>
                <div className="text-[11px] text-slate-400">Parent Guardian (Congo Town)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Frequently Asked Questions</span>
            <h2 className="text-3xl font-bold text-white">Everything you need to know about Savina OS</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What happens when power or internet cuts off in our school?',
                a: 'Savina is engineered with an offline-first architecture. Teachers can continue taking roll call, recording continuous assessments, and presenting downloaded slides. When power/cellular connectivity returns, all data synchronizes automatically to the cloud.',
              },
              {
                q: 'How do parents receive updates if they do not have smartphones or internet data?',
                a: 'Savina includes an integrated Liberia SMS Gateway that dispatches standard text messages directly to basic GSM feature phones (MTN Lonestar Cell and Orange Liberia) for attendance and fee receipts.',
              },
              {
                q: 'How are tuition payments processed through MTN MoMo and Orange Money?',
                a: 'When an invoice is issued, parents can initiate an instant Mobile Money push request or use their school USSD merchant code. Payments are settled in real-time in either USD or LRD and update the school ledger immediately.',
              },
              {
                q: 'Is Savina aligned with the Liberia Ministry of Education standards?',
                a: 'Yes. Savina incorporates the official Liberia MoE curriculum competencies for Early Childhood, Basic Education, and Senior High School, including standard WASSCE weightings and compliance export reports.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <h4 className="text-sm font-bold text-white">{faq.q}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="py-16 bg-gradient-to-r from-emerald-950 via-teal-900 to-indigo-950 border-t border-emerald-800/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to upgrade your school to Liberia's premier K-12 OS?
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto">
            Join hundreds of forward-thinking institutions delivering world-class education with offline resilience and automated mobile payments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onOpenSignUp('school')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-950 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>Register Your School Today</span>
            </button>
            <button
              onClick={() => onEnterPortal('admin_overview')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-base border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Demo Environment</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-base">
              S
            </div>
            <div>
              <div className="text-white font-bold text-sm">Savina Learning Center & K-12 OS</div>
              <div className="text-[11px] text-slate-500">Monrovia, Republic of Liberia • Serving West Africa</div>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap text-slate-400 text-xs">
            <button onClick={() => onEnterPortal('moe_library')} className="hover:text-white transition">MoE Library</button>
            <button onClick={() => onEnterPortal('db_security')} className="hover:text-white transition">PostgreSQL RLS</button>
            <button onClick={onOpenLogin} className="hover:text-white transition">Member Sign In</button>
            <button onClick={() => onOpenSignUp('school')} className="hover:text-white transition">School Registration</button>
          </div>

          <div className="text-slate-500 text-[11px]">
            &copy; {new Date().getFullYear()} Savina Educational Technologies Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
