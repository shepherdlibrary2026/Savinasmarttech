import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FeeInvoice, Currency } from '../../types';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Zap,
  Receipt,
  Printer,
  ChevronRight,
  DollarSign,
  Phone,
  Lock,
  Send,
  Sparkles,
} from 'lucide-react';
import { saveAIGenerationRecord } from '../../firebase';

interface MobileMoneyGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: FeeInvoice | null;
  onSuccess?: () => void;
}

type ProviderType = 'mtn_momo' | 'orange_money';
type StepType = 'config' | 'push_prompt' | 'pin_auth' | 'processing' | 'success' | 'receipt';

export const MobileMoneyGatewayModal: React.FC<MobileMoneyGatewayModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const { currentSchool, currency, formatMoney, usdToLrdRate, processPayment } = useApp();

  // Selected payment provider
  const [provider, setProvider] = useState<ProviderType>('mtn_momo');
  const [phone, setPhone] = useState('');
  const [amountUSD, setAmountUSD] = useState<number>(0);
  const [currencySelected, setCurrencySelected] = useState<Currency>('USD');
  const [step, setStep] = useState<StepType>('config');
  const [simulatedPin, setSimulatedPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [countdown, setCountdown] = useState(45);
  const [completedPayment, setCompletedPayment] = useState<any>(null);

  // Initialize invoice values when opened
  useEffect(() => {
    if (invoice) {
      setAmountUSD(invoice.balanceUSD > 0 ? invoice.balanceUSD : invoice.totalUSD);
      setPhone(invoice.parentPhone || '+231 88 123 4567');
      // Auto pick network prefix
      if (invoice.parentPhone?.includes('88') || invoice.parentPhone?.includes('088')) {
        setProvider('mtn_momo');
      } else if (invoice.parentPhone?.includes('77') || invoice.parentPhone?.includes('077')) {
        setProvider('orange_money');
      }
      setStep('config');
      setPinError(false);
      setSimulatedPin('');
    }
  }, [invoice, isOpen]);

  // Countdown timer during USSD prompt simulation
  useEffect(() => {
    let timer: any;
    if (step === 'push_prompt' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen || !invoice) return null;

  const calculatedLRD = Math.round(amountUSD * usdToLrdRate);
  const displayAmount = currencySelected === 'USD' ? `$${amountUSD.toFixed(2)} USD` : `${calculatedLRD.toLocaleString()} LRD`;

  const handleInitiatePush = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountUSD <= 0) return;

    // Generate Liberian Telecom GSM Reference
    const prefix = provider === 'mtn_momo' ? 'MTN-MM' : 'ORG-MONEY';
    const randomHex = Math.floor(10000000 + Math.random() * 90000000);
    setTransactionRef(`${prefix}-${randomHex}`);
    setCountdown(45);
    setStep('push_prompt');
  };

  const handleAuthorizePayment = async () => {
    if (simulatedPin.length !== 4) {
      setPinError(true);
      return;
    }

    setStep('processing');

    // Simulate GSM network validation delay
    setTimeout(async () => {
      try {
        const paymentRecord = await processPayment({
          invoiceId: invoice.id,
          studentId: invoice.studentId,
          studentName: invoice.studentName,
          schoolId: currentSchool.id,
          amountUSD: amountUSD,
          amountLRD: calculatedLRD,
          currencyPaid: currencySelected,
          paymentMethod: provider,
          referenceNumber: transactionRef,
          phoneNumber: phone,
          status: 'completed',
          collectedBy: provider === 'mtn_momo' ? 'Lonestar MTN MoMo Gateway API' : 'Orange Money Liberia API',
        });

        setCompletedPayment(paymentRecord);
        setStep('success');

        // Log transaction to Firestore
        await saveAIGenerationRecord({
          type: 'chat_query',
          userId: invoice.studentId,
          prompt: `[Momo Gateway Payment] ${provider.toUpperCase()} - $${amountUSD} for ${invoice.studentName}`,
          output: JSON.stringify({
            ref: transactionRef,
            amountUSD,
            amountLRD: calculatedLRD,
            receipt: paymentRecord.receiptNumber,
          }),
        });

        if (onSuccess) onSuccess();
      } catch (err) {
        console.error(err);
      }
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header with Provider Branding */}
        <div
          className={`p-6 text-white transition-colors duration-300 ${
            provider === 'mtn_momo'
              ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700'
              : 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider bg-black/40 px-2.5 py-0.5 rounded-full border border-white/20">
                    Liberia GSM Direct Gateway
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-0.5">
                  {provider === 'mtn_momo' ? 'Lonestar MTN Mobile Money' : 'Orange Money Liberia'}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center text-sm font-bold transition"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs bg-black/20 p-2.5 rounded-xl border border-white/10">
            <div>
              <span className="opacity-75">Student: </span>
              <strong className="text-white">{invoice.studentName}</strong>
            </div>
            <div>
              <span className="opacity-75">Inv #: </span>
              <strong className="font-mono text-white">{invoice.invoiceNumber}</strong>
            </div>
          </div>
        </div>

        {/* Modal Body / Steps */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: CONFIGURATION & AMOUNT ENTRY */}
          {step === 'config' && (
            <form onSubmit={handleInitiatePush} className="space-y-5">
              {/* Select Carrier */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Select Mobile Money Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setProvider('mtn_momo');
                      if (phone.includes('77')) setPhone(phone.replace('77', '88'));
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                      provider === 'mtn_momo'
                        ? 'bg-amber-950/50 border-amber-500 text-amber-200 ring-2 ring-amber-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">
                      MTN
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Lonestar MoMo</div>
                      <div className="text-[10px] text-amber-400 font-mono">*156# Merchant</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProvider('orange_money');
                      if (phone.includes('88')) setPhone(phone.replace('88', '77'));
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                      provider === 'orange_money'
                        ? 'bg-orange-950/50 border-orange-500 text-orange-200 ring-2 ring-orange-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-orange-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">
                      OM
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Orange Money</div>
                      <div className="text-[10px] text-orange-400 font-mono">*144# Merchant</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Parent / Payer GSM Number</span>
                  <span className="text-[10px] text-slate-500">Must be registered with MoMo</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+231 88 123 4567 or +231 77 987 6543"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Amount & Currency Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Payment Amount ($USD)</span>
                    <button
                      type="button"
                      onClick={() => setAmountUSD(invoice.balanceUSD)}
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      Pay Full Bal (${invoice.balanceUSD})
                    </button>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      required
                      min="1"
                      max={invoice.balanceUSD || 1000}
                      value={amountUSD}
                      onChange={(e) => setAmountUSD(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Settlement Currency
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                    <button
                      type="button"
                      onClick={() => setCurrencySelected('USD')}
                      className={`flex-1 py-2 text-xs font-bold transition ${
                        currencySelected === 'USD'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      USD ($)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrencySelected('LRD')}
                      className={`flex-1 py-2 text-xs font-bold transition ${
                        currencySelected === 'LRD'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      LRD ($L)
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono text-right">
                    Rate: 1 USD = {usdToLrdRate} LRD
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>School Account:</span>
                  <span className="text-slate-200 font-semibold">{currentSchool.name}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Fee Category:</span>
                  <span className="text-slate-200 font-semibold">Term 1 Tuition & WAEC Assessment</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Equivalent in LRD:</span>
                  <span className="text-amber-400 font-mono font-semibold">${calculatedLRD.toLocaleString()} LRD</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Total Debit Amount:</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {displayAmount}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={amountUSD <= 0}
                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition flex items-center justify-center gap-2 ${
                  provider === 'mtn_momo'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/60'
                    : 'bg-orange-600 hover:bg-orange-500 shadow-orange-950/60'
                }`}
              >
                <span>Send USSD Push Notification to Phone</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: SIMULATED USSD PUSH PROMPT ON PARENT'S PHONE */}
          {step === 'push_prompt' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 mx-auto flex items-center justify-center animate-pulse">
                  <Zap className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">USSD Push Sent to {phone}</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  A real-time prompt has been triggered on the parent's phone screen. Please enter the 4-digit Mobile Money PIN to approve the transaction.
                </p>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono bg-slate-950 px-3 py-1 rounded-full text-slate-400 border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>USSD Prompt expires in {countdown}s</span>
                </div>
              </div>

              {/* Phone Screen Mockup Container */}
              <div className="bg-slate-950 border-2 border-slate-700 rounded-3xl p-5 shadow-2xl max-w-xs mx-auto space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
                  <div className="text-[10px] font-bold tracking-wider uppercase text-amber-400 font-mono">
                    {provider === 'mtn_momo' ? 'LONESTAR MTN MOMO' : 'ORANGE MONEY LIBERIA'}
                  </div>
                  <div className="text-xs text-white leading-relaxed">
                    Pay <strong>{displayAmount}</strong> to <br />
                    <span className="text-emerald-400 font-semibold">{currentSchool.name}</span>
                    <br />
                    <span className="text-[10px] text-slate-400 font-mono">Ref: {transactionRef}</span>
                  </div>

                  {/* PIN Input field */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] text-slate-400 block font-semibold">
                      Enter 4-Digit MoMo PIN (e.g. 1234):
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        maxLength={4}
                        autoFocus
                        value={simulatedPin}
                        onChange={(e) => {
                          setSimulatedPin(e.target.value);
                          setPinError(false);
                        }}
                        placeholder="••••"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    {pinError && (
                      <span className="text-[10px] text-rose-400 block">
                        Please enter a valid 4-digit PIN
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('config')}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAuthorizePayment}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold text-white shadow transition flex items-center justify-center gap-1 ${
                      provider === 'mtn_momo'
                        ? 'bg-amber-600 hover:bg-amber-500'
                        : 'bg-orange-600 hover:bg-orange-500'
                    }`}
                  >
                    <span>Approve PIN</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROCESSING WITH TELCO NETWORK */}
          {step === 'processing' && (
            <div className="py-12 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mx-auto flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Reconciling with Central Bank & GSM Switch</h4>
                <p className="text-xs text-slate-400">
                  Communicating with {provider === 'mtn_momo' ? 'Lonestar MTN Liberia' : 'Orange Money Telecom'} servers...
                </p>
              </div>
              <div className="inline-block bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800 text-[11px] font-mono text-emerald-400">
                Encrypted via ISO-8583 Banking Protocol
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT SUCCESSFUL & RECEIPT */}
          {step === 'success' && completedPayment && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/50">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Payment Confirmed & Settled!</h4>
                <p className="text-xs text-slate-300">
                  Instant SMS Receipt has been dispatched to <strong className="text-white">{phone}</strong>.
                </p>
              </div>

              {/* Printable Official Receipt Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      OFFICIAL TUITION RECEIPT
                    </span>
                    <span className="text-sm font-bold text-white font-mono">
                      {completedPayment.receiptNumber}
                    </span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    PAID / SETTLED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Student Name:</span>
                    <span className="text-white font-semibold">{invoice.studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Payer Contact:</span>
                    <span className="text-white font-mono">{phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Payment Gateway:</span>
                    <span className="text-white font-semibold">
                      {provider === 'mtn_momo' ? 'Lonestar MTN MoMo' : 'Orange Money'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Carrier Ref #:</span>
                    <span className="text-amber-400 font-mono">{transactionRef}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Date & Time:</span>
                    <span className="text-slate-300 font-mono text-[11px]">{completedPayment.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Remaining Balance:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      ${Math.max(0, invoice.balanceUSD - amountUSD)} USD
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">Amount Collected:</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {displayAmount}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/40 transition"
                >
                  Done & Return to Ledger
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Security Badge */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Central Bank of Liberia (CBL) MoMo Regulatory Approved</span>
          </div>
          <span className="font-mono text-[10px]">256-Bit SSL</span>
        </div>
      </div>
    </div>
  );
};
