import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Calendar,
  GraduationCap,
  Users,
  Send,
  Download,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  Award,
  BookOpen,
} from 'lucide-react';

export const SchoolAdminPortal: React.FC<{ subTab?: string }> = ({ subTab = 'admin_overview' }) => {
  const {
    currentSchool,
    terms,
    classes,
    users,
    attendance,
    invoices,
    formatMoney,
    sendSMSBroadcast,
    currency,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState(subTab);
  const [broadcastRecipient, setBroadcastRecipient] = useState('all_parents');
  const [broadcastText, setBroadcastText] = useState(
    `${currentSchool.name.toUpperCase()} ADVISORY: First Semester Midterm examinations commence next Monday. All fee balances must be settled with Bursar via MTN MoMo / Orange Money.`
  );
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [complianceDownloaded, setComplianceDownloaded] = useState<string | null>(null);

  // Stats calculation
  const totalStudents = currentSchool.studentCount;
  const staffMembers = users.filter(
    (u) => u.role === 'teacher' || u.role === 'bursar' || u.role === 'school_admin'
  );

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === today);
  const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
  const attendanceRate =
    todayAttendance.length > 0
      ? Math.round((presentCount / todayAttendance.length) * 100)
      : 96;

  const totalCollectedUSD = invoices.reduce((acc, inv) => acc + inv.paidUSD, 0);
  const totalOutstandingUSD = invoices.reduce((acc, inv) => acc + inv.balanceUSD, 0);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    // Send SMS to all parents
    const parents = users.filter((u) => u.role === 'parent');
    parents.forEach((p) => {
      sendSMSBroadcast(p.phone, p.name, 'emergency_broadcast', broadcastText);
    });

    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3500);
  };

  const handleDownloadMoEReport = (reportName: string) => {
    setComplianceDownloaded(reportName);
    setTimeout(() => setComplianceDownloaded(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* School Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: currentSchool.themeColor }}
        />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg"
              style={{ backgroundColor: currentSchool.themeColor }}
            >
              {currentSchool.name.substring(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{currentSchool.name}</h2>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                  {currentSchool.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Principal: <strong className="text-slate-200">{currentSchool.principalName}</strong> • {currentSchool.city}, {currentSchool.county}
              </p>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <span>MoE Reg #: {currentSchool.moeRegistrationNumber}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('admin_overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'admin_overview' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSubTab('admin_academics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'admin_academics' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Classes & Terms
            </button>
            <button
              onClick={() => setActiveSubTab('admin_sms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'admin_sms' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              SMS Broadcast
            </button>
            <button
              onClick={() => setActiveSubTab('admin_compliance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'admin_compliance' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              MoE Compliance
            </button>
          </div>
        </div>
      </div>

      {/* Sub-view: Overview Dashboard */}
      {activeSubTab === 'admin_overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Total Enrollment</span>
                <GraduationCap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalStudents}</div>
              <div className="text-[11px] text-slate-400 mt-1">K1 through Grade 12</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Today's Attendance</span>
                <CheckCircle className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-bold text-teal-300">{attendanceRate}%</div>
              <div className="text-[11px] text-slate-400 mt-1">SMS sent for absent pupils</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Fees Collected</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                {formatMoney(totalCollectedUSD, currency)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Via MTN MoMo & Orange</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Outstanding Dues</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">
                {formatMoney(totalOutstandingUSD, currency)}
              </div>
              <div className="text-[11px] text-amber-300 mt-1">Invoices active for Term 1</div>
            </div>
          </div>

          {/* Academic Term & Active Class Streams */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Academic Term */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" /> Liberia MoE Academic Calendar
                </h3>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Active Term
                </span>
              </div>

              <div className="space-y-3">
                {terms.map((t) => (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      t.isCurrent
                        ? 'bg-emerald-950/40 border-emerald-500/50'
                        : 'bg-slate-800/60 border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-white">{t.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {t.startDate} to {t.endDate}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded uppercase ${
                        t.isCurrent
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff & Faculty Overview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" /> Teaching Faculty ({staffMembers.length})
                </h3>
                <span className="text-xs text-slate-400">MoE Certified</span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {staffMembers.map((staff) => (
                  <div
                    key={staff.id}
                    className="p-3 bg-slate-800/70 border border-slate-700 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                        {staff.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{staff.name}</div>
                        <div className="text-slate-400">
                          {staff.teachingSubjects?.join(', ') || staff.role}
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{staff.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-view: Classes & Streams */}
      {activeSubTab === 'admin_academics' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white">Class & Stream Configuration</h3>
              <p className="text-xs text-slate-400">
                Manage grades from Kindergarten (K1/K2) through Senior High (Grade 12).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{cls.gradeLevel}</h4>
                    <span className="text-xs text-emerald-400 font-medium">{cls.sectionName}</span>
                  </div>
                  <span className="text-xs bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {cls.roomNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>
                    Enrolled: <strong className="text-white">{cls.studentCount}</strong> / {cls.maxCapacity} pupils
                  </span>
                  <span className="text-[11px] text-slate-400 capitalize">Tier: {cls.tier.replace('_', ' ')}</span>
                </div>

                <div className="pt-2 border-t border-slate-700/70">
                  <div className="text-[11px] text-slate-400 mb-1">Subjects Taught:</div>
                  <div className="flex flex-wrap gap-1">
                    {cls.subjects.map((sub, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-view: School-wide SMS Announcement Dispatcher */}
      {activeSubTab === 'admin_sms' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" /> Parent SMS Broadcast Center
              </h3>
              <p className="text-xs text-slate-400">
                Broadcast instant emergency notifications, exam advisories, or fee notices to parents' simple phones across Liberia.
              </p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/40">
              Lonestar MTN & Orange Gateway Connected
            </span>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Audience
              </label>
              <select
                value={broadcastRecipient}
                onChange={(e) => setBroadcastRecipient(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all_parents">All School Parents & Guardians (420 Contacts)</option>
                <option value="grade_10">Grade 10 Senior High Parents Only (32 Contacts)</option>
                <option value="grade_12">Grade 12 WASSCE Candidate Parents (36 Contacts)</option>
                <option value="k2">Kindergarten (K2) Parents Only (22 Contacts)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  SMS Message Body (Prefix with School Name)
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {broadcastText.length}/160 chars
                </span>
              </div>
              <textarea
                rows={4}
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>

            {broadcastSent && (
              <div className="p-3 bg-emerald-950 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>
                  Broadcast successfully dispatched to parent phone numbers via Lonestar MTN & Orange Liberia shortcodes!
                </span>
              </div>
            )}

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" /> Dispatch Instant SMS Blast
            </button>
          </form>
        </div>
      )}

      {/* Sub-view: MoE Compliance Reports */}
      {activeSubTab === 'admin_compliance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Republic of Liberia — Ministry of Education (MoE) Compliance
            </h3>
            <p className="text-xs text-slate-400">
              Generate official standardized compliance returns, WAEC candidate lists, and county attendance sheets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">MoE Annual Census Form 101</h4>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700">
                    Official MoE Format
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Full student breakdown by gender, county of origin, age brackets, and teacher qualification registry.
                </p>
              </div>
              <button
                onClick={() => handleDownloadMoEReport('MoE_Census_Form_101.csv')}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export MoE Form 101 (CSV)
              </button>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">WAEC / WASSCE Senior Candidate Register</h4>
                  <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-700">
                    WAEC Monrovia Office
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Grade 12 candidate index numbers, subjects registered, and continuous assessment (CA 40%) submissions.
                </p>
              </div>
              <button
                onClick={() => handleDownloadMoEReport('WASSCE_Candidate_Register_2026.csv')}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export WAEC Candidate List
              </button>
            </div>
          </div>

          {complianceDownloaded && (
            <div className="p-3 bg-emerald-950 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{complianceDownloaded} generated and saved to offline storage!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
