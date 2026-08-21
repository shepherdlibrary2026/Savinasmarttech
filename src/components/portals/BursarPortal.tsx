import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  DollarSign,
  Receipt,
  Search,
  CheckCircle,
  Clock,
  Printer,
  Plus,
  ArrowUpDown,
  Smartphone,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { MobileMoneyGatewayModal } from './MobileMoneyGatewayModal';

export const BursarPortal: React.FC<{ subTab?: string }> = ({ subTab = 'bursar_invoices' }) => {
  const { invoices, payments, processPayment, formatMoney, currentSchool, currency } = useApp();

  const [activeTab, setActiveTab] = useState(subTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Mobile Money Gateway Modal State
  const [isMoMoModalOpen, setIsMoMoModalOpen] = useState(false);
  const [momoInvoice, setMomoInvoice] = useState<any>(null);

  // Manual payment entry state
  const [isManualPayOpen, setIsManualPayOpen] = useState(false);
  const [manualAmountUSD, setManualAmountUSD] = useState(50);
  const [manualMethod, setManualMethod] = useState<'cash' | 'bank_transfer' | 'mtn_momo' | 'orange_money'>('cash');
  const [manualRef, setManualRef] = useState('');

  const totalInvoicedUSD = invoices.reduce((acc, inv) => acc + inv.totalUSD, 0);
  const totalCollectedUSD = invoices.reduce((acc, inv) => acc + inv.paidUSD, 0);
  const totalOutstandingUSD = invoices.reduce((acc, inv) => acc + inv.balanceUSD, 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRecordManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    await processPayment({
      invoiceId: selectedInvoice.id,
      studentId: selectedInvoice.studentId,
      studentName: selectedInvoice.studentName,
      schoolId: currentSchool.id,
      amountUSD: manualAmountUSD,
      amountLRD: Math.round(manualAmountUSD * 198),
      currencyPaid: 'USD',
      paymentMethod: manualMethod,
      referenceNumber: manualRef || `DEP-LR-${Date.now()}`,
      phoneNumber: selectedInvoice.parentPhone,
      status: 'completed',
      collectedBy: `Bursar Office (${manualMethod.toUpperCase()})`,
    });

    setIsManualPayOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Bursar Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Bursar & Registrar Office
            </span>
            <span className="text-xs text-slate-400">
              {currentSchool.name}
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white">Tuition & Accounts Ledger</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Track tuition receivables, cash bank deposits, and Mobile Money gateway reconciliations in USD and LRD.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('bursar_invoices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'bursar_invoices'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tuition Ledger
          </button>
          <button
            onClick={() => setActiveTab('bursar_payments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'bursar_payments'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Payment Transactions ({payments.length})
          </button>
        </div>
      </div>

      {/* Mobile Money Direct Gateway Quick Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Lonestar MTN MoMo & Orange Money Gateway</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                Instant USSD Push (*156# / *144#)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Trigger instant payment requests directly to parents' mobile phones and automatically issue digital SMS receipts with WAEC clearance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold">
              MTN: *156#
            </span>
            <span className="px-2 py-1 rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/30 text-[11px] font-mono font-bold">
              Orange: *144#
            </span>
          </div>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase">Total Invoiced</div>
          <div className="text-2xl font-bold text-white mt-1">
            {formatMoney(totalInvoicedUSD, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Term 1 Assessment</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase">Total Collected</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {formatMoney(totalCollectedUSD, currency)}
          </div>
          <div className="text-[11px] text-emerald-300 mt-0.5 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {Math.round((totalCollectedUSD / (totalInvoicedUSD || 1)) * 100)}% Recovery Rate
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase">Outstanding Balance</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {formatMoney(totalOutstandingUSD, currency)}
          </div>
          <div className="text-[11px] text-amber-300 mt-0.5">Awaiting exam clearance</div>
        </div>
      </div>

      {/* TAB 1: Invoices Ledger */}
      {activeTab === 'bursar_invoices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student or invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Invoices</option>
                <option value="paid">Paid in Full</option>
                <option value="partial">Partial Balance</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Parent / Contact</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Balance Due</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/60 transition">
                    <td className="p-3 font-mono font-semibold text-white">{inv.invoiceNumber}</td>
                    <td className="p-3 font-semibold text-white">{inv.studentName}</td>
                    <td className="p-3 text-slate-300">
                      <div>{inv.parentName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{inv.parentPhone}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-200">
                      {formatMoney(inv.totalUSD, currency)}
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">
                      {formatMoney(inv.paidUSD, currency)}
                    </td>
                    <td className="p-3 font-mono text-amber-400 font-bold">
                      {formatMoney(inv.balanceUSD, currency)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {inv.balanceUSD > 0 && (
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => {
                              setMomoInvoice(inv);
                              setIsMoMoModalOpen(true);
                            }}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-md shadow-amber-950/40 transition flex items-center gap-1"
                            title="Process with MTN MoMo or Orange Money"
                          >
                            <Smartphone className="w-3 h-3" />
                            <span>MoMo Direct</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setManualAmountUSD(inv.balanceUSD);
                              setIsManualPayOpen(true);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg text-xs font-semibold border border-slate-700 transition"
                          >
                            Manual Slip
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Payment Transactions Feed */}
      {activeTab === 'bursar_payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Payment Collections Log</h3>
            <span className="text-xs text-slate-400">Reconciled with GSM Gateways</span>
          </div>

          <div className="space-y-2.5">
            {payments.map((p) => (
              <div
                key={p.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{p.receiptNumber}</span>
                    <span className="text-[10px] bg-slate-900 text-emerald-300 px-2 py-0.5 rounded border border-slate-700 font-mono uppercase">
                      {p.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-slate-300 mt-1">
                    Student: <strong className="text-white">{p.studentName}</strong> • Collected via {p.collectedBy}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Carrier Ref: {p.referenceNumber} • Date: {p.date}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-emerald-400 text-base font-mono">
                      {formatMoney(p.amountUSD, currency)}
                    </div>
                    <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 justify-end">
                      <CheckCircle className="w-3 h-3" /> Reconciled
                    </span>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                    title="Print Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Record Deposit Modal */}
      {isManualPayOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Record Tuition Collection</h3>
              <button
                onClick={() => setIsManualPayOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordManualPayment} className="space-y-3">
              <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                Student: <strong className="text-white">{selectedInvoice.studentName}</strong> (Balance: ${selectedInvoice.balanceUSD} USD)
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Amount ($USD)</label>
                <input
                  type="number"
                  required
                  value={manualAmountUSD}
                  onChange={(e) => setManualAmountUSD(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Collection Channel</label>
                <select
                  value={manualMethod}
                  onChange={(e) => setManualMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="cash">Cash at Bursar Window</option>
                  <option value="bank_transfer">Ecobank / LBDI Bank Deposit</option>
                  <option value="mtn_momo">MTN Mobile Money Manual Transfer</option>
                  <option value="orange_money">Orange Money Manual Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Bank Slip / Ref Number</label>
                <input
                  type="text"
                  placeholder="e.g. ECO-TX-88219"
                  value={manualRef}
                  onChange={(e) => setManualRef(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualPayOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow"
                >
                  Issue Receipt & Send SMS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Money Gateway Modal (Lonestar MTN MoMo & Orange Money) */}
      <MobileMoneyGatewayModal
        isOpen={isMoMoModalOpen}
        invoice={momoInvoice}
        onClose={() => {
          setIsMoMoModalOpen(false);
          setMomoInvoice(null);
        }}
      />
    </div>
  );
};
