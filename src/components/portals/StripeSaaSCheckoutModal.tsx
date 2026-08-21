import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolTenant, StripeSaaSPlan, StripeSaaSInvoice } from '../../types';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
  Check,
  ChevronRight,
  Receipt,
  Download,
  Calendar,
  Zap,
  Clock,
  ArrowRight,
  Globe,
  Radio,
  ExternalLink,
  Percent,
} from 'lucide-react';
import { saveAIGenerationRecord } from '../../firebase';

interface StripeSaaSCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSchool?: SchoolTenant;
  defaultPlanId?: 'community' | 'standard' | 'enterprise';
}

export const StripeSaaSCheckoutModal: React.FC<StripeSaaSCheckoutModalProps> = ({
  isOpen,
  onClose,
  targetSchool,
  defaultPlanId,
}) => {
  const {
    currentSchool,
    schools,
    stripePlans,
    stripeInvoices,
    processStripeSubscription,
    cancelStripeSubscription,
    formatMoney,
  } = useApp();

  const activeSchool = targetSchool || currentSchool;

  const [selectedPlanId, setSelectedPlanId] = useState<'community' | 'standard' | 'enterprise'>(
    defaultPlanId || (activeSchool.subscriptionPlan as any) || 'standard'
  );
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');

  // Form Fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardholderName, setCardholderName] = useState(
    activeSchool.principalName ? `Admin: ${activeSchool.principalName}` : 'Rev. Emmanuel Kollie'
  );
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('884');
  const [postalCode, setPostalCode] = useState('1000 Monrovia');
  const [isTestMode, setIsTestMode] = useState(true);

  // Flow State
  const [step, setStep] = useState<'plan_and_card' | 'processing' | 'success'>('plan_and_card');
  const [latestInvoice, setLatestInvoice] = useState<StripeSaaSInvoice | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (activeSchool) {
      setSelectedPlanId(defaultPlanId || (activeSchool.subscriptionPlan as any) || 'standard');
      setCardholderName(
        activeSchool.principalName ? `Admin: ${activeSchool.principalName}` : 'School Admin'
      );
      setStep('plan_and_card');
      setErrorMessage('');
    }
  }, [activeSchool, defaultPlanId, isOpen]);

  if (!isOpen || !activeSchool) return null;

  const selectedPlan = stripePlans.find((p) => p.id === selectedPlanId) || stripePlans[1];
  const priceUSD = billingInterval === 'annual' ? selectedPlan.priceAnnualUSD : selectedPlan.priceMonthlyUSD;
  const isAnnualDiscount = billingInterval === 'annual';

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleFillTestCard = (brand: 'visa' | 'mastercard') => {
    if (brand === 'visa') {
      setCardNumber('4242 4242 4242 4242');
      setExpiry('12/28');
      setCvc('321');
    } else {
      setCardNumber('5555 5555 5555 4444');
      setExpiry('10/29');
      setCvc('992');
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!cardNumber || cardNumber.length < 10) {
      setErrorMessage('Please provide a valid debit or credit card number.');
      return;
    }

    setStep('processing');

    try {
      const result = await processStripeSubscription(
        activeSchool.id,
        selectedPlanId,
        billingInterval,
        {
          cardNumber,
          cardholderName,
          expiry,
          cvc,
          postalCode,
        }
      );

      if (result.success) {
        setLatestInvoice(result.invoice);
        setStep('success');

        // Audit log in Firebase
        await saveAIGenerationRecord({
          type: 'chat_query',
          userId: activeSchool.id,
          prompt: `[Stripe SaaS Gateway] Subscription provisioned: ${selectedPlan.name} (${billingInterval}) - $${priceUSD} USD for ${activeSchool.name}`,
          output: JSON.stringify({
            stripeInvoiceId: result.invoice.stripeInvoiceId,
            stripeCustomerId: result.updatedSchool.stripeCustomerId,
            stripePaymentIntentId: result.invoice.stripePaymentIntentId,
            receiptNumber: result.invoice.receiptNumber,
            amountUSD: priceUSD,
          }),
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment authentication failed with Stripe API');
      setStep('plan_and_card');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border-b border-indigo-500/20 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/40">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Stripe SaaS Billing Gateway
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Stripe Elements 2026
                </span>
              </div>
              <p className="text-xs text-slate-300">
                School Tenant: <span className="font-semibold text-emerald-300">{activeSchool.name}</span> ({activeSchool.county})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {step === 'plan_and_card' && (
            <form onSubmit={handleSubmitPayment} className="space-y-5">
              {/* Billing Cycle Switcher */}
              <div className="flex items-center justify-between bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setBillingInterval('monthly')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    billingInterval === 'monthly'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval('annual')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    billingInterval === 'annual'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Annual Billing
                  <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
                    Save 17% (2 mos free)
                  </span>
                </button>
              </div>

              {/* Tier Selection Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Subscription Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {stripePlans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    const price = billingInterval === 'annual' ? plan.priceAnnualUSD : plan.priceMonthlyUSD;
                    const periodText = billingInterval === 'annual' ? '/yr' : '/mo';

                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`cursor-pointer rounded-2xl p-4 border transition relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                            Most Popular
                          </div>
                        )}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{plan.name}</span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="mt-2">
                            <span className="text-2xl font-black text-white">${price}</span>
                            <span className="text-xs text-slate-400">{periodText}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Up to {plan.studentLimit} students & {plan.staffLimit} teachers.
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-300 space-y-1">
                          {plan.features.slice(0, 3).map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stripe Payment Card Input (PCI Compliant Emulation) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Stripe 256-Bit Encrypted Card Form
                    </span>
                  </div>
                  {/* Quick Fill Test Cards */}
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-slate-400">Autofill Test:</span>
                    <button
                      type="button"
                      onClick={() => handleFillTestCard('visa')}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded font-mono"
                    >
                      Visa 4242
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillTestCard('mastercard')}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded font-mono"
                    >
                      Mastercard
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1 font-medium">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="e.g. Dr. Joseph S. Weah Jr."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1 font-medium">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono tracking-wider focus:outline-none focus:border-indigo-500"
                    />
                    <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-medium">
                      Expiration (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-medium">
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="•••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-medium">
                      Postal / City
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Monrovia, LR"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Order Summary & Submit Button */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">
                    Total Due Now
                  </div>
                  <div className="text-xl font-black text-white">
                    ${priceUSD}.00 USD
                    <span className="text-xs text-slate-400 font-normal ml-1">
                      / {billingInterval}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/40 transition"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ${priceUSD} with Stripe</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin flex items-center justify-center">
                <Lock className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">Authorizing Stripe Payment Intent...</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Connecting to Stripe secure banking networks for {activeSchool.name} SaaS license activation.
                </p>
              </div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>3D Secure 2.0 Verification in Progress</span>
              </div>
            </div>
          )}

          {step === 'success' && latestInvoice && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-black text-white">SaaS Subscription Activated!</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                  <span className="font-semibold text-emerald-400">{activeSchool.name}</span> is now upgraded to the{' '}
                  <span className="font-bold text-white uppercase">{latestInvoice.planId} Tier</span>. Stripe invoice #{latestInvoice.receiptNumber} has been generated.
                </p>
              </div>

              {/* Stripe Receipt Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5 font-mono text-xs text-slate-300 max-w-lg mx-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-sans font-bold">Stripe SaaS Receipt</span>
                  <span className="text-emerald-400 font-bold uppercase">{latestInvoice.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice ID:</span>
                  <span className="text-white font-bold">{latestInvoice.stripeInvoiceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Intent:</span>
                  <span className="text-indigo-300 truncate max-w-[200px]">{latestInvoice.stripePaymentIntentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Card Charged:</span>
                  <span className="text-white uppercase">{latestInvoice.cardBrand} •••• {latestInvoice.cardLast4}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Charged:</span>
                  <span className="text-emerald-400 font-bold">${latestInvoice.amountUSD}.00 USD ({latestInvoice.billingInterval})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span>{latestInvoice.paidAt}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
                >
                  Done & Return to SaaS Admin
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Guarantee */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted directly with Stripe tokenization</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Powered by Stripe Payments</span>
            <span className="font-mono text-indigo-400">v3-api</span>
          </div>
        </div>
      </div>
    </div>
  );
};
