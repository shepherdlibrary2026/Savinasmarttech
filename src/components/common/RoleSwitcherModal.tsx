import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  X,
  Shield,
  Building,
  GraduationCap,
  Sparkles,
  BookOpen,
  Users,
  Wallet,
  CheckCircle2,
} from 'lucide-react';

export const RoleSwitcherModal: React.FC<{
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}> = ({ onClose, onSelectTab }) => {
  const { users, currentUser, setCurrentUser, currentSchool } = useApp();

  const personas = [
    {
      role: 'platform_admin' as UserRole,
      title: 'Savina Platform Admin',
      subtitle: 'SaaS owner overview, multi-school subscriptions & national metrics',
      icon: Shield,
      color: 'from-purple-600 to-indigo-700',
      userId: 'user_platform_admin',
      defaultTab: 'platform_admin',
    },
    {
      role: 'school_admin' as UserRole,
      title: 'School Proprietor / Principal',
      subtitle: `${currentSchool.name} setup, terms, staff & MoE compliance exports`,
      icon: Building,
      color: 'from-emerald-600 to-teal-700',
      userId: 'user_school_admin',
      defaultTab: 'admin_overview',
    },
    {
      role: 'teacher' as UserRole,
      title: 'High School Teacher (Math & Physics)',
      subtitle: 'Master Emmanuel Gbotoe - WASSCE continuous assessment & attendance',
      icon: GraduationCap,
      color: 'from-blue-600 to-cyan-700',
      userId: 'user_teacher_g10',
      defaultTab: 'teacher_attendance',
    },
    {
      role: 'teacher' as UserRole,
      title: 'Early Childhood Teacher (K-2)',
      subtitle: 'Madam Marylyn Doe - Phonics, songs, story audio & simple quizzes',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-600',
      userId: 'user_teacher_k2',
      defaultTab: 'teacher_attendance',
    },
    {
      role: 'student' as UserRole,
      title: 'Junior Kid Student (K-2 Age 5)',
      subtitle: 'Blessing Doe - Big buttons, read-aloud voice TTS, phonics & badges',
      icon: Sparkles,
      color: 'from-pink-500 to-rose-600',
      userId: 'student_k2_blessing',
      defaultTab: 'student_dashboard',
    },
    {
      role: 'student' as UserRole,
      title: 'Senior High Student (Grade 10)',
      subtitle: 'Alvin Sherman - WASSCE prep, notes, low-data audio & past papers',
      icon: BookOpen,
      color: 'from-teal-600 to-emerald-700',
      userId: 'student_g10_alvin',
      defaultTab: 'student_dashboard',
    },
    {
      role: 'parent' as UserRole,
      title: 'Parent / Guardian',
      subtitle: 'Hon. Thomas Sherman - Child attendance, report cards & MTN MoMo pay',
      icon: Users,
      color: 'from-amber-600 to-amber-800',
      userId: 'user_parent_sherman',
      defaultTab: 'parent_overview',
    },
    {
      role: 'bursar' as UserRole,
      title: 'School Bursar & Registrar',
      subtitle: 'Mr. Gabriel Kpadeh - Tuition invoicing, cash/bank & Mobile Money ledger',
      icon: Wallet,
      color: 'from-slate-700 to-slate-900',
      userId: 'user_bursar',
      defaultTab: 'bursar_invoices',
    },
  ];

  const handleSelect = (userId: string, defaultTab: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      onSelectTab(defaultTab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Switch User Persona</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Multi-Role Demo
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Experience Savina Learning Center from different stakeholder perspectives in Liberia.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona list */}
        <div className="p-6 overflow-y-auto space-y-3">
          {personas.map((p) => {
            const isCurrent = currentUser.id === p.userId;
            const Icon = p.icon;

            return (
              <button
                key={p.userId + p.title}
                onClick={() => handleSelect(p.userId, p.defaultTab)}
                className={`w-full flex items-start gap-4 p-3.5 rounded-xl border text-left transition ${
                  isCurrent
                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white shrink-0 shadow-md`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm text-white">{p.title}</h3>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" /> Active Now
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{p.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 text-slate-400 text-xs flex items-center justify-between">
          <span>Active Tenant: <strong className="text-white">{currentSchool.name}</strong></span>
          <span className="text-slate-500">Instant Role Switching Enabled</span>
        </div>
      </div>
    </div>
  );
};
