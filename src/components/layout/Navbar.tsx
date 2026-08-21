import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  School,
  Wifi,
  WifiOff,
  Signal,
  DollarSign,
  UserCheck,
  MessageSquareText,
  RefreshCw,
  Zap,
  Globe,
  Sliders,
  Sparkles,
  LogIn,
  Home,
  HardDrive,
  Database,
  Activity,
  BarChart3,
} from 'lucide-react';
import { OfflineDiagnosticsModal } from './OfflineDiagnosticsModal';

export const Navbar: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ activeTab, setActiveTab }) => {
  const {
    schools,
    currentSchool,
    setCurrentSchool,
    currentUser,
    switchRole,
    connectionMode,
    setConnectionMode,
    dataSaverActive,
    setDataSaverActive,
    offlineQueue,
    triggerSyncQueue,
    currency,
    setCurrency,
    smsLogs,
    setActiveRoleModalOpen,
    setSmsGatewayModalOpen,
    dataBytesSavedKb,
    setIsLandingView,
    setLoginModalOpen,
    setSignUpModalOpen,
    setSignUpInitialMode,
    openAiSuite,
    isPhysicalOffline,
    effectiveNetworkType,
    networkLatencyMs,
    offlineDiagnosticsModalOpen,
    setOfflineDiagnosticsModalOpen,
  } = useApp();

  const [syncing, setSyncing] = React.useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await triggerSyncQueue();
    setSyncing(false);
  };

  const isOfflineActive = connectionMode === 'offline' || isPhysicalOffline;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'platform_admin':
        return 'Platform Admin';
      case 'school_admin':
        return 'School Proprietor / Admin';
      case 'teacher':
        return 'Teacher';
      case 'student':
        return currentUser.studentTier === 'k3_early' ? 'K-2 Kid Student' : 'High School Student';
      case 'parent':
        return 'Parent / Guardian';
      case 'bursar':
        return 'Bursar / Registrar';
      default:
        return role;
    }
  };

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
      {/* Top Banner: Emerging Market Network & Data Saver Bar */}
      <div
        className={`px-4 py-1.5 text-xs border-b transition-colors duration-200 flex flex-wrap items-center justify-between gap-2 ${
          isOfflineActive
            ? 'bg-rose-950/90 border-rose-800/60 text-rose-200'
            : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Network Simulator & Offline Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
              isOfflineActive
                ? 'bg-rose-900/80 border-rose-500/50 text-rose-100 shadow-sm animate-pulse'
                : 'bg-slate-900 border-slate-700'
            }`}
            onClick={() => setOfflineDiagnosticsModalOpen(true)}
            title="Click to view Offline Architecture & Local Storage Diagnostics"
          >
            <span className={isOfflineActive ? 'text-rose-300 font-bold' : 'text-slate-400'}>Network:</span>
            {connectionMode === 'online_4g' && !isPhysicalOffline && (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Wifi className="w-3.5 h-3.5" /> 4G Fast {networkLatencyMs ? `(${networkLatencyMs}ms)` : ''}
              </span>
            )}
            {connectionMode === 'slow_3g' && !isPhysicalOffline && (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <Signal className="w-3.5 h-3.5" /> Slow 3G ({effectiveNetworkType || '128kbps'})
              </span>
            )}
            {isOfflineActive && (
              <span className="flex items-center gap-1 text-rose-200 font-bold">
                <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Offline Mode (Local Storage Active)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setConnectionMode('online_4g')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                connectionMode === 'online_4g' && !isPhysicalOffline
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              4G
            </button>
            <button
              onClick={() => setConnectionMode('slow_3g')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                connectionMode === 'slow_3g' && !isPhysicalOffline
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              3G
            </button>
            <button
              onClick={() => setConnectionMode('offline')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                isOfflineActive
                  ? 'bg-rose-600 text-white shadow ring-1 ring-rose-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Offline
            </button>
          </div>

          {/* Storage & Diagnostics Quick Trigger */}
          <button
            onClick={() => setOfflineDiagnosticsModalOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition ${
              isOfflineActive
                ? 'bg-rose-900/60 border-rose-500/40 text-rose-200 hover:bg-rose-800'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Inspect Offline-First Local Storage, ServiceWorker Caches, and Pending Sync Queue"
          >
            <HardDrive className="w-3 h-3 text-amber-400" />
            <span>Local DB & SW</span>
            {offlineQueue.length > 0 && (
              <span className="bg-amber-500/30 text-amber-200 text-[10px] px-1 rounded font-bold">
                {offlineQueue.length}
              </span>
            )}
          </button>

          {/* Data Saver Mode Toggle */}
          <button
            onClick={() => setDataSaverActive(!dataSaverActive)}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition border ${
              dataSaverActive
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Saves mobile data by compressing images and preferring audio+slides over video"
          >
            <Zap className={`w-3 h-3 ${dataSaverActive ? 'text-emerald-400 fill-emerald-400' : ''}`} />
            <span>Data Saver: {dataSaverActive ? 'ON' : 'OFF'}</span>
            <span className="text-[10px] opacity-75 bg-slate-900 px-1.5 rounded">
              {(dataBytesSavedKb / 1024).toFixed(1)} MB saved
            </span>
          </button>
        </div>

        {/* Right side quick actions */}
        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-900 rounded border border-slate-700 p-0.5">
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
              title="1 USD = 198 Liberian Dollars"
            >
              L$ LRD
            </button>
          </div>

          {/* Offline Sync Queue status */}
          {offlineQueue.length > 0 && (
            <button
              onClick={handleSync}
              disabled={isOfflineActive || syncing}
              className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-xs hover:bg-amber-500/30 transition animate-pulse"
              title={isOfflineActive ? 'Actions queued locally. Will upload when back online.' : 'Click to sync offline changes to cloud'}
            >
              <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
              <span>{offlineQueue.length} Pending Sync</span>
            </button>
          )}

          {/* Liberia SMS Gateway Monitor */}
          <button
            onClick={() => setSmsGatewayModalOpen(true)}
            className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 transition text-[11px]"
            title="Open Liberia SMS Gateway Log"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-emerald-400" />
            <span>SMS Gateway ({smsLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Main App Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-4">
        {/* Brand & Tenant Selector */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md text-white font-black text-xl">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg tracking-tight text-white flex items-center gap-1.5">
                Savina <span className="text-emerald-400">Learning Center</span>
              </h1>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-1.5 py-0.5 rounded uppercase font-semibold">
                Liberia K-12
              </span>
              {isOfflineActive && (
                <button
                  onClick={() => setOfflineDiagnosticsModalOpen(true)}
                  className="flex items-center gap-1 text-[10px] bg-rose-950/90 text-rose-300 border border-rose-500/60 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse hover:bg-rose-900 transition shadow-sm"
                  title="Offline Mode Active - Click for storage diagnostics"
                >
                  <WifiOff className="w-3 h-3 text-rose-400" />
                  <span>Offline Mode</span>
                </button>
              )}
            </div>
            {/* Active School Tenant */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <School className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={currentSchool.id}
                onChange={(e) => {
                  const s = schools.find((sch) => sch.id === e.target.value);
                  if (s) setCurrentSchool(s);
                }}
                className="bg-slate-800 text-white font-medium border border-slate-700 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {schools.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    {sch.name} ({sch.county})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs based on Role */}
        <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs overflow-x-auto max-w-full">
          {currentUser.role === 'platform_admin' && (
            <>
              <button
                onClick={() => setActiveTab('platform_admin')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'platform_admin' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                SaaS Dashboard
              </button>
              <button
                onClick={() => setActiveTab('stripe_saas_billing')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'stripe_saas_billing'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-indigo-300 hover:text-white'
                }`}
              >
                <span>Stripe Gateway</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
              <button
                onClick={() => setActiveTab('schools_directory')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'schools_directory' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                All Schools ({schools.length})
              </button>
            </>
          )}

          {currentUser.role === 'school_admin' && (
            <>
              <button
                onClick={() => setActiveTab('admin_overview')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'admin_overview' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                School Overview
              </button>
              <button
                onClick={() => setActiveTab('admin_academics')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'admin_academics' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Classes & Terms
              </button>
              <button
                onClick={() => setActiveTab('admin_sms')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'admin_sms' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                SMS Broadcast
              </button>
              <button
                onClick={() => setActiveTab('admin_compliance')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'admin_compliance' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                MoE Compliance
              </button>
            </>
          )}

          {currentUser.role === 'teacher' && (
            <>
              <button
                onClick={() => setActiveTab('teacher_analytics')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'teacher_analytics' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Class & MoE Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('teacher_attendance')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'teacher_attendance' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Attendance Sheet
              </button>
              <button
                onClick={() => setActiveTab('teacher_gradebook')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'teacher_gradebook' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Continuous Assessment
              </button>
              <button
                onClick={() => setActiveTab('teacher_lessons')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'teacher_lessons' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Lesson Planner
              </button>
              <button
                onClick={() => setActiveTab('teacher_live')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'teacher_live' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Live Classroom
              </button>
            </>
          )}

          {currentUser.role === 'student' && (
            <>
              <button
                onClick={() => setActiveTab('student_dashboard')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'student_dashboard' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                {currentUser.studentTier === 'k3_early' ? '🌟 My Fun Learning' : 'Courses & Lessons'}
              </button>
              <button
                onClick={() => setActiveTab('student_assignments')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'student_assignments' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                {currentUser.studentTier === 'k3_early' ? '🏆 Fun Quizzes' : 'WASSCE Quizzes'}
              </button>
              <button
                onClick={() => setActiveTab('student_offline')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'student_offline' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                📥 Offline Downloads
              </button>
              <button
                onClick={() => setActiveTab('student_grades')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'student_grades' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                📊 Report Card
              </button>
            </>
          )}

          {currentUser.role === 'parent' && (
            <>
              <button
                onClick={() => setActiveTab('parent_overview')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'parent_overview' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Children Progress
              </button>
              <button
                onClick={() => setActiveTab('parent_fees')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'parent_fees' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Mobile Money Pay (MoMo/Orange)
              </button>
              <button
                onClick={() => setActiveTab('parent_messages')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'parent_messages' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Teacher Messages
              </button>
            </>
          )}

          {currentUser.role === 'bursar' && (
            <>
              <button
                onClick={() => setActiveTab('bursar_invoices')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'bursar_invoices' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Tuition Ledger
              </button>
              <button
                onClick={() => setActiveTab('bursar_payments')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'bursar_payments' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                MoMo Collections
              </button>
            </>
          )}

          {/* Shared MoE Digital Library Tab */}
          <button
            onClick={() => setActiveTab('moe_library')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'moe_library' ? 'bg-amber-600 text-white shadow' : 'text-amber-300 hover:text-white'
            }`}
          >
            📚 MoE Library
          </button>

          {/* Database Architecture & RLS Security Explorer */}
          <button
            onClick={() => setActiveTab('db_security')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'db_security' ? 'bg-indigo-600 text-white shadow ring-1 ring-indigo-400' : 'text-indigo-300 hover:text-white'
            }`}
          >
            <span className="text-xs">🛡️</span> PostgreSQL RLS
          </button>
        </nav>

        {/* Action Controls & User Persona */}
        <div className="flex items-center gap-2">
          {/* Gemini & Firebase AI Suite Launcher Button */}
          <button
            onClick={() => openAiSuite('search')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-md text-xs font-bold transition animate-pulse"
            title="Open Gemini AI Suite: Search Grounding, Chatbot, Voice Live, Music, Video & Image Studio"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Gemini AI Suite</span>
          </button>

          {/* View Landing Page Button */}
          <button
            onClick={() => setIsLandingView(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
            title="Return to Public Landing Page"
          >
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Landing Page</span>
          </button>

          {/* Quick Sign In Modal Trigger */}
          <button
            onClick={() => setLoginModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
            title="Sign In with Email, OTP or Persona"
          >
            <LogIn className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Sign In</span>
          </button>

          {/* Quick Register School Modal Trigger */}
          <button
            onClick={() => {
              setSignUpInitialMode('school');
              setSignUpModalOpen(true);
            }}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition"
            title="Register a new Institution"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Register School</span>
          </button>

          {/* User Persona & Role Switcher Button */}
          <button
            onClick={() => setActiveRoleModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl transition text-left"
            title="Switch User Role Persona"
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-emerald-500/60"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-xs">
                {currentUser.name[0]}
              </div>
            )}
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                <span>{currentUser.name.split(' ')[0]}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded">
                  Switch
                </span>
              </div>
              <div className="text-[10px] text-slate-400">{getRoleLabel(currentUser.role)}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Offline Architecture & Local Storage Diagnostics Modal */}
      <OfflineDiagnosticsModal
        isOpen={offlineDiagnosticsModalOpen}
        onClose={() => setOfflineDiagnosticsModalOpen(false)}
      />
    </header>
  );
};
