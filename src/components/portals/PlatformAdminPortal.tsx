import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolTenant } from '../../types';
import {
  Building,
  Plus,
  Users,
  Shield,
  TrendingUp,
  MapPin,
  CheckCircle,
  Phone,
  Mail,
  Zap,
  Globe,
  Radio,
  CreditCard,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StripeSaaSAdminView } from './StripeSaaSAdminView';
import { StripeSaaSCheckoutModal } from './StripeSaaSCheckoutModal';

const LIBERIAN_COUNTIES = [
  'Montserrado County',
  'Margibi County',
  'Nimba County',
  'Bong County',
  'Grand Bassa County',
  'Lofa County',
  'Grand Cape Mount County',
  'Maryland County',
  'Sinoe County',
  'Bomi County',
  'Grand Gedeh County',
  'Rivercess County',
  'River Gee County',
  'Gbarpolu County',
  'Grand Kru County',
];

export const PlatformAdminPortal: React.FC<{ initialSubTab?: 'tenants' | 'stripe_gateway' }> = ({
  initialSubTab = 'tenants',
}) => {
  const {
    schools,
    currentSchool,
    setCurrentSchool,
    registerNewSchool,
    formatMoney,
    dataBytesSavedKb,
    stripePlans,
    stripeInvoices,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'tenants' | 'stripe_gateway'>(initialSubTab);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [stripeModalSchool, setStripeModalSchool] = useState<SchoolTenant | null>(null);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    county: 'Montserrado County',
    city: 'Monrovia',
    address: '',
    phone: '+231 ',
    email: '',
    motto: '',
    themeColor: '#047857',
    principalName: '',
    establishedYear: 2010,
    moeRegistrationNumber: 'MOE-LR-2025-',
    subscriptionPlan: 'standard' as 'community' | 'standard' | 'enterprise',
    studentCount: 150,
    staffCount: 12,
    supportedCurriculum: ['Liberia MoE Curriculum', 'WAEC / WASSCE Standards'],
    momoMerchantIdMTN: 'MOMO-',
    orangeMoneyMerchantId: 'OM-',
    activeTermId: 'term_1_2025',
  });

  const totalStudents = schools.reduce((acc, s) => acc + s.studentCount, 0);
  const totalStaff = schools.reduce((acc, s) => acc + s.staffCount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    registerNewSchool(formData);
    setIsAddModalOpen(false);
  };

  const handleOpenStripeForSchool = (school: SchoolTenant) => {
    setStripeModalSchool(school);
    setStripeModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* SaaS Header & Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Multi-Tenant Platform Control
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Monrovia Data Hub
              </span>
            </div>
            <h2 className="text-2xl font-black mt-1 text-white tracking-tight">
              Savina SaaS Platform Management
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mt-1">
              Serving K-12 private, faith-based, and community schools across Liberia with Stripe SaaS billing & low-bandwidth offline resilience.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveSubTab('stripe_gateway')}
              className={`flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl shadow-lg transition text-sm shrink-0 ${
                activeSubTab === 'stripe_gateway'
                  ? 'bg-indigo-500 text-white ring-2 ring-indigo-300'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Stripe Payment Gateway
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg transition text-sm shrink-0"
            >
              <Plus className="w-4 h-4" /> Onboard School
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('tenants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'tenants'
              ? 'bg-slate-800 text-white border border-slate-700 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Building className="w-4 h-4 text-emerald-400" />
          <span>School Tenants Directory ({schools.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stripe_gateway')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'stripe_gateway'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
              : 'text-indigo-300 hover:text-white hover:bg-indigo-950/40 border border-indigo-500/30'
          }`}
        >
          <CreditCard className="w-4 h-4 text-indigo-300" />
          <span>Stripe SaaS Payment Gateway</span>
          <span className="bg-indigo-400/20 text-indigo-200 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
            Live
          </span>
        </button>
      </div>

      {/* Render Active Sub-Tab */}
      {activeSubTab === 'stripe_gateway' ? (
        <StripeSaaSAdminView />
      ) : (
        <>
          {/* Top Stat Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Schools</span>
                <Building className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{schools.length}</div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> 100% Ministry Accredited
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Students</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalStudents.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 mt-1">{totalStaff} Teachers & Staff</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Monthly SaaS MRR</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                ${schools.reduce((acc, s) => {
                  const plan = stripePlans.find((p) => p.id === s.subscriptionPlan);
                  return acc + (plan?.priceMonthlyUSD || 49);
                }, 0)}.00 USD
              </div>
              <div className="text-[11px] text-indigo-400 mt-1 flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> Stripe Recurring Billing Active
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Data Traffic Saved</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {(dataBytesSavedKb / 1024).toFixed(1)} MB
              </div>
              <div className="text-[11px] text-amber-300 mt-1">Via low-data slide engine</div>
            </div>
          </div>

          {/* Schools Directory (Multi-Tenant Overview) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-white">Registered School Tenants</h3>
                <p className="text-xs text-slate-400">
                  Each school operates in a dedicated, branded workspace with independent data isolation.
                </p>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
                Tenant Isolation: <strong>Strict Row-Level Active</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {schools.map((school) => {
                const isCurrent = currentSchool.id === school.id;
                const plan = stripePlans.find((p) => p.id === school.subscriptionPlan);

                return (
                  <div
                    key={school.id}
                    className={`bg-slate-800/70 border rounded-xl p-5 flex flex-col justify-between transition relative overflow-hidden ${
                      isCurrent
                        ? 'border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {/* Header color accent */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5"
                      style={{ backgroundColor: school.themeColor }}
                    />

                    <div>
                      <div className="flex items-start justify-between gap-2 mt-1">
                        <div>
                          <h4 className="font-bold text-white text-base leading-tight">
                            {school.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            {school.city}, {school.county}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            school.subscriptionPlan === 'enterprise'
                              ? 'bg-purple-900/60 text-purple-300 border border-purple-700'
                              : school.subscriptionPlan === 'standard'
                              ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                              : 'bg-amber-900/60 text-amber-300 border border-amber-700'
                          }`}
                        >
                          {school.subscriptionPlan}
                        </span>
                      </div>

                      <p className="text-xs italic text-slate-300 mt-2 bg-slate-900/60 p-2 rounded border border-slate-800">
                        "{school.motto}"
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                        <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-400">Students</div>
                          <div className="font-bold text-white text-sm">{school.studentCount}</div>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-400">Staff</div>
                          <div className="font-bold text-white text-sm">{school.staffCount}</div>
                        </div>
                      </div>

                      <div className="mt-3 text-[11px] text-slate-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Stripe Billing:</span>
                          <span className="text-indigo-300 font-mono font-bold flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            {school.cardBrand?.toUpperCase() || 'VISA'} •••• {school.cardLast4 || '4242'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Plan Rate:</span>
                          <span className="text-emerald-400 font-bold">
                            ${plan?.priceMonthlyUSD || 49}/mo ({school.billingInterval || 'monthly'})
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          MoE Reg: {school.moeRegistrationNumber}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenStripeForSchool(school)}
                        className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <CreditCard className="w-3 h-3" /> Stripe Plan
                      </button>

                      <button
                        onClick={() => setCurrentSchool(school)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          isCurrent
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                      >
                        {isCurrent ? 'Active School' : 'Enter Workspace'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Add School Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Onboard New Liberian School</h3>
                <p className="text-xs text-slate-400">Configure new tenant database partition & credentials.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">School Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buchanan Community High School"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">County</label>
                  <select
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {LIBERIAN_COUNTIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">City / District</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Buchanan City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Principal / Proprietor</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madam Cecelia Gaye"
                    value={formData.principalName}
                    onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">MoE Registration #</label>
                  <input
                    type="text"
                    required
                    placeholder="MOE-LR-2025-..."
                    value={formData.moeRegistrationNumber}
                    onChange={(e) => setFormData({ ...formData, moeRegistrationNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Subscription Plan</label>
                  <select
                    value={formData.subscriptionPlan}
                    onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="community">Community Tier ($19/mo - up to 250 students)</option>
                    <option value="standard">Standard Tier ($49/mo - up to 600 students)</option>
                    <option value="enterprise">Enterprise Tier ($120/mo - Unlimited)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Estimated Student Body</label>
                  <input
                    type="number"
                    value={formData.studentCount}
                    onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">School Motto</label>
                <input
                  type="text"
                  placeholder="e.g. Labor Omnia Vincit (Hard Work Conquers All)"
                  value={formData.motto}
                  onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs shadow-md"
                >
                  Provision School Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Stripe Checkout Modal */}
      {stripeModalSchool && (
        <StripeSaaSCheckoutModal
          isOpen={stripeModalOpen}
          onClose={() => setStripeModalOpen(false)}
          targetSchool={stripeModalSchool}
        />
      )}
    </div>
  );
};
