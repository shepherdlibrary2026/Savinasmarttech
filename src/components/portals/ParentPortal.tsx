import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Wallet,
  CheckCircle,
  Clock,
  Send,
  Download,
  Phone,
  QrCode,
  AlertCircle,
  FileText,
  Smartphone,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { Currency } from '../../types';
import { StudentAcademicVisualizer } from '../analytics/StudentAcademicVisualizer';

export const ParentPortal: React.FC<{ subTab?: string }> = ({ subTab = 'parent_overview' }) => {
  const {
    currentUser,
    users,
    currentSchool,
    invoices,
    payments,
    processPayment,
    attendance,
    reportCards,
    messages,
    sendMessage,
    formatMoney,
    currency,
  } = useApp();

  const [activeTab, setActiveTab] = useState(subTab);

  // Parent's children
  const childrenIds = currentUser.parentOfStudentIds || ['student_g10_alvin', 'student_k2_blessing'];
  const children = users.filter((u) => childrenIds.includes(u.id));

  const [selectedChildId, setSelectedChildId] = useState<string>(
    children[0]?.id || 'student_g10_alvin'
  );

  const selectedChild = children.find((c) => c.id === selectedChildId) || children[0];

  // Mobile Money Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [paymentProvider, setPaymentProvider] = useState<'mtn_momo' | 'orange_money'>('mtn_momo');
  const [paymentPhone, setPaymentPhone] = useState(currentUser.phone || '+231 77 654 3210');
  const [payAmountUSD, setPayAmountUSD] = useState(75);
  const [momoPin, setMomoPin] = useState('');
  const [paymentStep, setPaymentStep] = useState<'details' | 'ussd_prompt' | 'success'>('details');
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  // Teacher Message form state
  const [messageText, setMessageText] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageSentNotification, setMessageSentNotification] = useState(false);

  // Invoices for selected child
  const childInvoices = invoices.filter((inv) => inv.studentId === selectedChildId);
  const childPayments = payments.filter((p) => p.studentId === selectedChildId);
  const childReport = reportCards.find((r) => r.studentId === selectedChildId);
  const childAttendance = attendance.filter((a) => a.studentId === selectedChildId);

  // Handle MoMo Payment Flow
  const handleInitiatePayment = (invoice: any) => {
    setSelectedInvoiceId(invoice.id);
    setPayAmountUSD(invoice.balanceUSD);
    setPaymentStep('details');
    setIsPaymentModalOpen(true);
  };

  const handleExecutePayment = async () => {
    setPaymentStep('ussd_prompt');

    // Simulate carrier network delay (~1.5s)
    setTimeout(async () => {
      const amountLRD = Math.round(payAmountUSD * 198);
      const receipt = await processPayment({
        invoiceId: selectedInvoiceId,
        studentId: selectedChild.id,
        studentName: selectedChild.name,
        schoolId: currentSchool.id,
        amountUSD: payAmountUSD,
        amountLRD,
        currencyPaid: 'USD',
        paymentMethod: paymentProvider,
        referenceNumber: `${paymentProvider === 'mtn_momo' ? 'MOMO' : 'OM'}-LR-${Math.floor(
          10000000 + Math.random() * 90000000
        )}`,
        phoneNumber: paymentPhone,
        status: 'completed',
        collectedBy:
          paymentProvider === 'mtn_momo'
            ? 'Lonestar MTN MoMo (*156#)'
            : 'Orange Money Liberia (*144#)',
      });

      setLastReceipt(receipt);
      setPaymentStep('success');
    }, 1600);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendMessage({
      schoolId: currentSchool.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: 'parent',
      recipientId: 'user_teacher_g10',
      recipientName: 'Master Emmanuel Gbotoe',
      studentId: selectedChild.id,
      studentName: selectedChild.name,
      subject: messageSubject || `Regarding ${selectedChild.name}`,
      message: messageText,
      smsSentFallback: true,
    });

    setMessageText('');
    setMessageSubject('');
    setMessageSentNotification(true);
    setTimeout(() => setMessageSentNotification(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Parent Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Parent & Guardian Portal
            </span>
            <span className="text-xs text-slate-400">
              Active School: {currentSchool.name}
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white">{currentUser.name}</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Monitor attendance, view official report cards, and pay school fees via MTN MoMo / Orange Money.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('parent_overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'parent_overview'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Child Overview
          </button>
          <button
            onClick={() => setActiveTab('parent_analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'parent_analytics'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>MoE Growth & Trends</span>
          </button>
          <button
            onClick={() => setActiveTab('parent_fees')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'parent_fees'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tuition & Mobile Money Pay
          </button>
          <button
            onClick={() => setActiveTab('parent_messages')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'parent_messages'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Teacher Messages
          </button>
        </div>
      </div>

      {/* Child Switcher Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase">Select Child:</span>
          <div className="flex gap-2">
            {children.map((child) => {
              const isSelected = selectedChildId === child.id;
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{child.name}</span>
                  <span className="text-[10px] opacity-80 bg-slate-900/60 px-1.5 py-0.2 rounded font-normal">
                    {child.gradeLevel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Viewing records for: <strong className="text-white">{selectedChild?.name}</strong>
        </div>
      </div>

      {/* TAB 1: Child Overview & Academic Progress */}
      {activeTab === 'parent_overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-400 uppercase">Term Average</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {childReport?.overallAverage || 92}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Class Position: {childReport?.classPosition || 1} of {childReport?.totalStudentsInClass || 30}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-400 uppercase">Attendance Record</div>
              <div className="text-2xl font-bold text-teal-300 mt-1">
                {childReport?.attendanceDaysPresent || 70} / {childReport?.attendanceDaysTotal || 70} Days
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> 100% On-Time Record
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-400 uppercase">Fee Balance</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                {formatMoney(childInvoices[0]?.balanceUSD || 0, currency)}
              </div>
              <div className="text-[11px] text-amber-300 mt-0.5">
                {childInvoices[0]?.balanceUSD ? 'Due before exams' : 'Fully Cleared'}
              </div>
            </div>
          </div>

          {/* Recharts MoE Benchmark & Academic Visualizer */}
          <StudentAcademicVisualizer
            reportCard={childReport}
            student={selectedChild}
            isParentView={true}
          />

          {/* Child Report Card Detail */}
          {childReport && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    First Semester Report Card — {selectedChild.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Conduct: <strong className="text-slate-200">{childReport.conduct}</strong>
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Subject</th>
                      <th className="p-3">CA (40%)</th>
                      <th className="p-3">Exam (60%)</th>
                      <th className="p-3">Total (100%)</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {childReport.subjects.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/60 transition">
                        <td className="p-3 font-semibold text-white">{sub.name}</td>
                        <td className="p-3 text-slate-300 font-mono">{sub.caScore}</td>
                        <td className="p-3 text-slate-300 font-mono">{sub.examScore}</td>
                        <td className="p-3 font-bold text-emerald-400 font-mono">{sub.totalScore}%</td>
                        <td className="p-3">
                          <span className="bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded border border-emerald-500/40">
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

      {/* TAB 1.5: Dedicated Full-Screen MoE Growth & Trends */}
      {activeTab === 'parent_analytics' && (
        <div className="space-y-6">
          <StudentAcademicVisualizer
            reportCard={childReport}
            student={selectedChild}
            isParentView={true}
          />
        </div>
      )}

      {/* TAB 2: Tuition & Mobile Money Payment Portal */}
      {activeTab === 'parent_fees' && (
        <div className="space-y-6">
          {/* Active Invoices List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Tuition & Fee Invoices</h3>
                <p className="text-xs text-slate-400">
                  Pay instantly using Lonestar MTN MoMo or Orange Money Liberia. No bank lines required.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  MTN MoMo *156#
                </span>
                <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2 py-0.5 rounded-full font-bold">
                  Orange Money *144#
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {childInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-mono text-slate-400">
                        Invoice: <strong className="text-white">{inv.invoiceNumber}</strong>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-0.5">
                        Term 1 Tuition & Comprehensive Fees
                      </h4>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  {/* Fee item breakdown */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs text-slate-300">
                    {inv.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span>{item.description}</span>
                        <span className="font-mono text-white">
                          {formatMoney(item.amountUSD, currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/80">
                    <div>
                      <div className="text-xs text-slate-400">Total: {formatMoney(inv.totalUSD, currency)}</div>
                      <div className="text-sm font-bold text-amber-400">
                        Balance Due: {formatMoney(inv.balanceUSD, currency)}
                      </div>
                    </div>

                    {inv.balanceUSD > 0 ? (
                      <button
                        onClick={() => handleInitiatePayment(inv)}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg transition flex items-center gap-1.5"
                      >
                        <Smartphone className="w-3.5 h-3.5" /> Pay with Mobile Money
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-700">
                        <CheckCircle className="w-4 h-4" /> Paid in Full
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Receipts History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Official Payment Receipts History</h3>

            <div className="space-y-2.5">
              {childPayments.map((pay) => (
                <div
                  key={pay.id}
                  className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>Receipt: {pay.receiptNumber}</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded">
                        {pay.paymentMethod.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-slate-400 mt-0.5">
                      Ref: {pay.referenceNumber} • {pay.date}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-emerald-400 text-sm font-mono">
                      {formatMoney(pay.amountUSD, currency)}
                    </div>
                    <div className="text-[10px] text-slate-500">Instant SMS Dispatched</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Direct Messages with Teacher */}
      {activeTab === 'parent_messages' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Message Class Teacher</h3>
              <p className="text-xs text-slate-400">
                Direct in-app communication. Messages automatically generate SMS fallback alerts.
              </p>
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="space-y-3 max-w-xl">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Homework Inquiry / Doctor Appointment"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Message Body</label>
              <textarea
                rows={4}
                required
                placeholder="Type your message to the teacher..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {messageSentNotification && (
              <div className="p-3 bg-emerald-950 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Message sent to Master Emmanuel Gbotoe!</span>
              </div>
            )}

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-md transition flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" /> Send Message to Teacher
            </button>
          </form>

          {/* Conversation feed */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase">Recent Messages</h4>
            {messages.map((m) => (
              <div
                key={m.id}
                className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 space-y-1.5 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">
                    {m.senderName} ({m.senderRole})
                  </span>
                  <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                </div>
                <div className="text-emerald-400 font-semibold text-xs">{m.subject}</div>
                <p className="text-slate-300">{m.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MOBILE MONEY PAYMENT MODAL (USSD & API Simulator) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  Liberia Mobile Money Checkout
                </h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {paymentStep === 'details' && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Student:</span>
                    <strong className="text-white">{selectedChild.name}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>School Merchant:</span>
                    <strong className="text-white">{currentSchool.name}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Amount to Pay:</span>
                    <strong className="text-emerald-400 font-mono font-bold text-sm">
                      {formatMoney(payAmountUSD, currency)}
                    </strong>
                  </div>
                </div>

                {/* Provider Selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Select Mobile Money Carrier
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentProvider('mtn_momo')}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        paymentProvider === 'mtn_momo'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <span className="font-black text-sm">Lonestar MTN</span>
                      <span className="text-[10px] font-mono">MoMo (*156#)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentProvider('orange_money')}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        paymentProvider === 'orange_money'
                          ? 'bg-orange-500/20 border-orange-500 text-orange-300 ring-1 ring-orange-500'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <span className="font-black text-sm">Orange Money</span>
                      <span className="text-[10px] font-mono">Orange (*144#)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Mobile Money Phone Number
                  </label>
                  <input
                    type="text"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Enter 4-Digit MoMo PIN (Secure)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={momoPin}
                    onChange={(e) => setMomoPin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-center tracking-widest text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExecutePayment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> Authorize Payment (${payAmountUSD} USD)
                </button>
              </div>
            )}

            {paymentStep === 'ussd_prompt' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto animate-spin">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    Dialing {paymentProvider === 'mtn_momo' ? '*156#' : '*144#'}...
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Sending USSD push authorization to {paymentPhone}. Please approve transaction on your mobile screen.
                  </p>
                </div>
              </div>
            )}

            {paymentStep === 'success' && lastReceipt && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-300 text-base">
                    Payment Successful!
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official tax receipt REC-{lastReceipt.receiptNumber} generated.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-left space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Receipt #:</span>
                    <span className="text-white">{lastReceipt.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount Paid:</span>
                    <span className="text-emerald-400 font-bold">
                      {formatMoney(lastReceipt.amountUSD, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Carrier Ref:</span>
                    <span className="text-slate-300">{lastReceipt.referenceNumber}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Done & Close Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
