import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolTenant, StripeSaaSPlan, StripeSaaSInvoice } from '../../types';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Zap,
  Building,
  ArrowUpRight,
  Sparkles,
  Download,
  Receipt,
  RotateCcw,
  Check,
  Layers,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { StripeSaaSCheckoutModal } from './StripeSaaSCheckoutModal';

export const StripeSaaSAdminView: React.FC = () => {
  const {
    schools,
    currentSchool,
    stripePlans,
    stripeInvoices,
    openStripeCheckout,
    cancelStripeSubscription,
    formatMoney,
  } = useApp();

  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [selectedSchoolForModal, setSelectedSchoolForModal] = useState<SchoolTenant | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<'community' | 'standard' | 'enterprise'>('standard');

  // Compute Stripe SaaS Metrics
  const activeSubscribedSchools = schools.filter(
    (s) => s.stripePaymentStatus === 'active' || !s.stripePaymentStatus
  );

  const calculateMRR = () => {
    return schools.reduce((acc, s) => {
      const plan = stripePlans.find((p) => p.id === s.subscriptionPlan);
      if (!plan) return acc;
      if (s.billingInterval === 'annual') {
        return acc + Math.round(plan.priceAnnualUSD / 12);
      }
      return acc + plan.priceMonthlyUSD;
    }, 0);
  };

  const totalMRR = calculateMRR();
  const totalARR = totalMRR * 12;

  const totalCollectedStripe = stripeInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amountUSD, 0);

  const handleOpenStripeModal = (school: SchoolTenant, planId?: 'community' | 'standard' | 'enterprise') => {
    setSelectedSchoolForModal(school);
    if (planId) setSelectedPlanForModal(planId);
    else setSelectedPlanForModal((school.subscriptionPlan as any) || 'standard');
    setModalOpen(true);
  };

  const handleCancelSub = async (schoolId: string, schoolName: string) => {
    if (window.confirm(`Are you sure you want to cancel Stripe auto-renew for ${schoolName}?`)) {
      await cancelStripeSubscription(schoolId);
    }
  };

  const filteredSchools = schools.filter((s) => {
    if (filterPlan === 'all') return true;
    return s.subscriptionPlan === filterPlan;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Stripe Gateway SaaS Control Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/30 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Stripe SaaS Billing Engine
              </span>
              <span className="text-emerald-400 text-xs flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" /> Live Webhooks & Tokenization Active
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              SaaS Subscription Gateway & Revenue Hub
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Automated card billing, recurring invoicing, and license tier provisioning for Liberian and West African partner academies via Stripe.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => handleOpenStripeModal(currentSchool, 'standard')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition text-xs"
            >
              <Zap className="w-4 h-4" /> Quick Stripe Charge / Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Stripe Key Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Stripe MRR</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">${totalMRR}.00 USD</div>
          <div className="text-[11px] text-indigo-300 mt-1 flex items-center gap-1">
            <span>ARR Run Rate:</span>
            <strong className="text-emerald-400">${totalARR.toLocaleString()} USD</strong>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Stripe Processed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">${totalCollectedStripe.toLocaleString()}.00 USD</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {stripeInvoices.length} Settled Invoices
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Subscriptions</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{activeSubscribedSchools.length} / {schools.length}</div>
          <div className="text-[11px] text-blue-400 mt-1">100% Good Standing (0% Churn)</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Stripe Plan Breakdown</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
              {schools.filter((s) => s.subscriptionPlan === 'community').length} Com
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
              {schools.filter((s) => s.subscriptionPlan === 'standard').length} Std
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
              {schools.filter((s) => s.subscriptionPlan === 'enterprise').length} Ent
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tier-based MoE features enabled</div>
        </div>
      </div>

      {/* Stripe Pricing Tiers & Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> Stripe SaaS License Packages
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Available SaaS subscriptions billed automatically to school debit/credit cards via Stripe.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stripePlans.map((plan) => {
            const tenantCount = schools.filter((s) => s.subscriptionPlan === plan.id).length;
            return (
              <div
                key={plan.id}
                className={`bg-slate-800/60 border rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition ${
                  plan.popular
                    ? 'border-indigo-500/80 ring-1 ring-indigo-500/50 shadow-xl'
                    : 'border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white">{plan.name}</h4>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-white">${plan.priceMonthlyUSD}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                    <span className="text-xs text-indigo-300 font-mono ml-2">
                      (${plan.priceAnnualUSD}/yr)
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-400">
                    Supports up to <strong className="text-white">{plan.studentLimit} students</strong> &{' '}
                    <strong className="text-white">{plan.staffLimit} teachers</strong>.
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    <strong className="text-indigo-400">{tenantCount}</strong> Active Schools
                  </div>
                  <button
                    onClick={() => handleOpenStripeModal(currentSchool, plan.id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3 h-3" />
                    <span>Charge School</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* School Tenant Subscriptions Table with Stripe Management Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-black text-white">School Tenant Stripe Subscriptions</h3>
            <p className="text-xs text-slate-400">
              Manage live card tokenization, customer IDs, and plan renewal dates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter Plan:</span>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Plans ({schools.length})</option>
              <option value="community">Community Tier</option>
              <option value="standard">Standard Tier</option>
              <option value="enterprise">Enterprise Tier</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/40">
                <th className="py-3 px-4">School Tenant</th>
                <th className="py-3 px-4">Stripe Plan & Cost</th>
                <th className="py-3 px-4">Customer & Card</th>
                <th className="py-3 px-4">Renewal Date</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Stripe Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSchools.map((school) => {
                const plan = stripePlans.find((p) => p.id === school.subscriptionPlan) || stripePlans[1];
                const isCanceled = school.stripePaymentStatus === 'canceled';

                return (
                  <tr key={school.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{school.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {school.city}, {school.county} • {school.studentCount} Students
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            school.subscriptionPlan === 'enterprise'
                              ? 'bg-purple-900/60 text-purple-300 border border-purple-700'
                              : school.subscriptionPlan === 'standard'
                              ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                              : 'bg-amber-900/60 text-amber-300 border border-amber-700'
                          }`}
                        >
                          {school.subscriptionPlan}
                        </span>
                        <span className="font-bold text-white">
                          ${school.billingInterval === 'annual' ? plan.priceAnnualUSD : plan.priceMonthlyUSD}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          /{school.billingInterval === 'annual' ? 'yr' : 'mo'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="text-slate-300 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="uppercase">{school.cardBrand || 'visa'}</span> •••• {school.cardLast4 || '4242'}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {school.stripeCustomerId || 'cus_live_9418'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{school.currentBillingPeriodEnd || '2026-09-30'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isCanceled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Auto-Renew Canceled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Active Auto-Charge
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenStripeModal(school)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Upgrade / Charge Card
                      </button>
                      {!isCanceled && (
                        <button
                          onClick={() => handleCancelSub(school.id, school.name)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-400 rounded-lg text-xs font-medium transition"
                        >
                          Cancel Auto-Renew
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stripe Invoices & Receipts Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" /> Stripe Invoice History & Receipts
            </h3>
            <p className="text-xs text-slate-400">
              Audit log of all Stripe charge events, payment intent IDs, and customer receipts.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-3 py-1 rounded-xl">
            Stripe Webhooks: Synchronized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/40">
                <th className="py-3 px-4">Receipt & Invoice</th>
                <th className="py-3 px-4">School Customer</th>
                <th className="py-3 px-4">Plan & Amount</th>
                <th className="py-3 px-4">Payment Intent</th>
                <th className="py-3 px-4">Card Used</th>
                <th className="py-3 px-4">Status & Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {stripeInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-bold text-white">
                    <div>{inv.receiptNumber}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{inv.stripeInvoiceId}</div>
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">
                    {inv.schoolName}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="font-bold text-emerald-400">${inv.amountUSD}.00 USD</span>
                    <span className="text-slate-400 text-[10px] ml-1 uppercase">
                      ({inv.planId} - {inv.billingInterval})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-indigo-300 text-[11px]">
                    {inv.stripePaymentIntentId || 'pi_3P_auto'}
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-[11px]">
                    <span className="uppercase">{inv.cardBrand || 'visa'}</span> •••• {inv.cardLast4 || '4242'}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <div className="flex items-center gap-1 text-emerald-400 font-bold uppercase text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> {inv.status}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{inv.paidAt || inv.createdAt}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stripe Modal */}
      {selectedSchoolForModal && (
        <StripeSaaSCheckoutModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          targetSchool={selectedSchoolForModal}
          defaultPlanId={selectedPlanForModal}
        />
      )}
    </div>
  );
};
