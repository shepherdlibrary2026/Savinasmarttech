import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  School,
  UserPlus,
  Building2,
  GraduationCap,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Mail,
  Lock,
  DollarSign,
  FileCheck,
  AlertCircle,
  X,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { UserRole, StudentTier } from '../../types';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onSuccessfulSignUp: () => void;
  initialMode?: 'school' | 'member';
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onSuccessfulSignUp,
  initialMode = 'school',
}) => {
  const { schools, registerNewSchool, setCurrentSchool, setCurrentUser, users } = useApp();

  const [signupType, setSignupType] = useState<'school' | 'member'>(initialMode);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successCelebration, setSuccessCelebration] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Institution Form Fields
  const [schoolName, setSchoolName] = useState<string>('');
  const [county, setCounty] = useState<string>('Montserrado');
  const [city, setCity] = useState<string>('Monrovia');
  const [address, setAddress] = useState<string>('Congo Town Back Road');
  const [phone, setPhone] = useState<string>('+231 77 555 9900');
  const [email, setEmail] = useState<string>('principal@newacademy.edu.lr');
  const [principalName, setPrincipalName] = useState<string>('Prof. Joseph K. Freeman');
  const [moeRegNum, setMoeRegNum] = useState<string>('MOE-LR-2025-0982');
  const [motto, setMotto] = useState<string>('Knowledge, Integrity, Leadership');
  const [tierPlan, setTierPlan] = useState<'community' | 'standard' | 'enterprise'>('standard');
  const [momoMTN, setMomoMTN] = useState<string>('MOMO-770-NEW-101');
  const [orangeMoney, setOrangeMoney] = useState<string>('OM-088-NEW-202');

  // Member Form Fields
  const [memberRole, setMemberRole] = useState<UserRole>('teacher');
  const [targetSchoolId, setTargetSchoolId] = useState<string>(schools[0]?.id || '');
  const [fullName, setFullName] = useState<string>('');
  const [memberEmail, setMemberEmail] = useState<string>('');
  const [memberPhone, setMemberPhone] = useState<string>('+231 77 123 4567');
  const [studentGrade, setStudentGrade] = useState<string>('Grade 10');
  const [studentTier, setStudentTier] = useState<StudentTier>('senior_high');
  const [childStudentId, setChildStudentId] = useState<string>('student_g10_alvin');
  const [schoolInviteCode, setSchoolInviteCode] = useState<string>('SAVINA-2025');

  if (!isOpen) return null;

  const handleRegisterSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName || !principalName || !email) {
      setErrorMessage('Please fill in all required institution fields.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const schoolCode = schoolName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4) + '-00' + (schools.length + 1);

      const newSchool = {
        name: schoolName,
        code: schoolCode,
        county,
        city,
        address,
        phone,
        email,
        motto,
        themeColor: '#059669',
        principalName,
        establishedYear: new Date().getFullYear(),
        moeRegistrationNumber: moeRegNum,
        subscriptionPlan: tierPlan,
        studentCount: 150,
        staffCount: 16,
        supportedCurriculum: ['Liberia MoE Standard Curriculum', 'WASSCE Exam Preparation Track'],
        momoMerchantIdMTN: momoMTN,
        orangeMoneyMerchantId: orangeMoney,
        activeTermId: 'term-2025-1',
      };

      registerNewSchool(newSchool);

      // Create Admin User for this school
      const newAdminUser = {
        id: `usr-admin-${Date.now()}`,
        schoolId: `sch-${Date.now()}`,
        email,
        name: principalName,
        role: 'school_admin' as UserRole,
        phone,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      };

      setCurrentUser(newAdminUser);
      setIsLoading(false);
      setSuccessCelebration(true);

      setTimeout(() => {
        onSuccessfulSignUp();
        onClose();
      }, 1500);
    }, 800);
  };

  const handleRegisterMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !memberEmail) {
      setErrorMessage('Please provide full name and email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const selectedSchool = schools.find((s) => s.id === targetSchoolId) || schools[0];
      setCurrentSchool(selectedSchool);

      const newMember = {
        id: `usr-${memberRole}-${Date.now()}`,
        schoolId: selectedSchool.id,
        email: memberEmail,
        name: fullName,
        role: memberRole,
        phone: memberPhone,
        gradeLevel: memberRole === 'student' ? studentGrade : undefined,
        studentTier: memberRole === 'student' ? studentTier : undefined,
        avatarUrl:
          memberRole === 'student'
            ? 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150'
            : memberRole === 'teacher'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
            : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      };

      setCurrentUser(newMember);
      setIsLoading(false);
      setSuccessCelebration(true);

      setTimeout(() => {
        onSuccessfulSignUp();
        onClose();
      }, 1500);
    }, 800);
  };

  const LIBERIA_COUNTIES = [
    'Montserrado',
    'Margibi',
    'Nimba',
    'Bong',
    'Grand Bassa',
    'Lofa',
    'Maryland',
    'Sinoe',
    'Grand Cape Mount',
    'Bomi',
    'Grand Gedeh',
    'Rivercess',
    'River Gee',
    'Gbarpolu',
    'Grand Kru',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/80 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Get Started with <span className="text-emerald-400">Savina OS</span>
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  New Registration
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-tenant educational management for Liberian institutions, educators & parents.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection: School vs Individual Member */}
        <div className="grid grid-cols-2 bg-slate-950/70 p-2 gap-1.5 border-b border-slate-800/80 text-xs">
          <button
            onClick={() => setSignupType('school')}
            className={`py-2.5 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              signupType === 'school'
                ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Register a School / Institution</span>
          </button>

          <button
            onClick={() => setSignupType('member')}
            className={`py-2.5 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              signupType === 'member'
                ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Join as Teacher / Student / Parent</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {successCelebration ? (
            <div className="py-12 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-white">Registration Complete!</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Setting up tenant environment, Row-Level Security rules, and MoE curriculum modules... Launching your customized dashboard now.
              </p>
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-3.5 flex items-start gap-3 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* PATHWAY 1: REGISTER A NEW SCHOOL */}
              {signupType === 'school' && (
                <form onSubmit={handleRegisterSchool} className="space-y-4">
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5 text-xs text-emerald-200 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>
                      Institutions receive instant tenant isolation, MoE-compliant syllabus tracking, and MTN MoMo / Orange Money tuition gateways.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        School / Academy Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="e.g. Monrovia College of Excellence"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Principal / Proprietor Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={principalName}
                        onChange={(e) => setPrincipalName(e.target.value)}
                        placeholder="e.g. Dr. Arthur Johnson"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Official Administrator Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@school.edu.lr"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Primary School Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+231 77 000 0000"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        County Location *
                      </label>
                      <select
                        value={county}
                        onChange={(e) => setCounty(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        {LIBERIA_COUNTIES.map((c) => (
                          <option key={c} value={c}>
                            {c} County
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        City / Settlement *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Monrovia, Harbel, Gbarnga, etc."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                        <span>MoE Registration Code</span>
                        <span className="text-[10px] text-emerald-400 font-normal">Accredited</span>
                      </label>
                      <input
                        type="text"
                        value={moeRegNum}
                        onChange={(e) => setMoeRegNum(e.target.value)}
                        placeholder="MOE-LR-2025-XXXX"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        School Motto
                      </label>
                      <input
                        type="text"
                        value={motto}
                        onChange={(e) => setMotto(e.target.value)}
                        placeholder="Excellence in Knowledge & Character"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Mobile Money Integration Section */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">Mobile Money Direct Settlement Accounts</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">MTN Lonestar MoMo Merchant ID</label>
                        <input
                          type="text"
                          value={momoMTN}
                          onChange={(e) => setMomoMTN(e.target.value)}
                          placeholder="MOMO-770-XXX-XXX"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Orange Money Merchant Code</label>
                        <input
                          type="text"
                          value={orangeMoney}
                          onChange={(e) => setOrangeMoney(e.target.value)}
                          placeholder="OM-088-XXX-XXX"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subscription Tier Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Select Institution Plan
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        {
                          id: 'community',
                          name: 'Community',
                          price: '$0 / Free',
                          desc: 'Up to 100 students, offline attendance, SMS alerts',
                        },
                        {
                          id: 'standard',
                          name: 'Standard Academy',
                          price: '$49 / mo',
                          desc: 'Unlimited classes, MoMo payments, AI lesson plans',
                        },
                        {
                          id: 'enterprise',
                          name: 'Enterprise Multi-Campus',
                          price: '$129 / mo',
                          desc: 'Unlimited students, custom domain, full MoE sync',
                        },
                      ].map((tier) => (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setTierPlan(tier.id as any)}
                          className={`text-left p-3 rounded-2xl border transition ${
                            tierPlan === tier.id
                              ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold text-emerald-300">{tier.name}</div>
                          <div className="text-xs font-bold text-white mt-0.5">{tier.price}</div>
                          <div className="text-[10px] text-slate-400 mt-1 leading-tight">{tier.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-xl shadow-emerald-950/60 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Complete School Registration & Launch Admin Portal</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* PATHWAY 2: JOIN AN EXISTING SCHOOL */}
              {signupType === 'member' && (
                <form onSubmit={handleRegisterMember} className="space-y-4">
                  <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-3.5 text-xs text-indigo-200 flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span>
                      Join your school community as an educator, student, or parent to access classroom materials and report cards.
                    </span>
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      I am joining as a:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'teacher', label: 'Teacher / Educator', icon: '👩‍🏫' },
                        { id: 'student', label: 'Student / Scholar', icon: '🎓' },
                        { id: 'parent', label: 'Parent / Guardian', icon: '👨‍👧' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setMemberRole(r.id as UserRole)}
                          className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                            memberRole === r.id
                              ? 'bg-indigo-950/80 border-indigo-500 ring-1 ring-indigo-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-xl">{r.icon}</span>
                          <span className="text-xs font-bold">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* School Tenant Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Select Your School / Institution *
                    </label>
                    <select
                      value={targetSchoolId}
                      onChange={(e) => setTargetSchoolId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.county})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Martha Sherman"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        placeholder="martha@example.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Mobile Phone (MTN / Orange)
                      </label>
                      <input
                        type="tel"
                        value={memberPhone}
                        onChange={(e) => setMemberPhone(e.target.value)}
                        placeholder="+231 77 000 0000"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        School Invite / Student ID Code
                      </label>
                      <input
                        type="text"
                        value={schoolInviteCode}
                        onChange={(e) => setSchoolInviteCode(e.target.value)}
                        placeholder="e.g. SLC-INVITE-2025"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Student Specific Fields */}
                  {memberRole === 'student' && (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="text-xs font-bold text-white">Student Academic Tier & Grade</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Grade Level</label>
                          <select
                            value={studentGrade}
                            onChange={(e) => {
                              const g = e.target.value;
                              setStudentGrade(g);
                              if (g.startsWith('K')) setStudentTier('k3_early');
                              else if (['Grade 10', 'Grade 11', 'Grade 12'].includes(g)) setStudentTier('senior_high');
                              else setStudentTier('junior_high');
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                          >
                            <option value="K1">K1 - Early Toddlers</option>
                            <option value="K2">K2 - Sunshine Explorers (Phonics)</option>
                            <option value="Grade 4">Grade 4 - Upper Elementary</option>
                            <option value="Grade 7">Grade 7 - Junior High</option>
                            <option value="Grade 10">Grade 10 - Senior High (WASSCE Track)</option>
                            <option value="Grade 12">Grade 12 - Senior High Finals</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Learning Experience UI</label>
                          <div className="text-xs font-medium text-emerald-400 py-2">
                            {studentTier === 'k3_early' ? '🌟 Gamified Big-Button Visual Mode' : '📚 Academic WASSCE High School Portal'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Create Account & Join {schools.find((s) => s.id === targetSchoolId)?.name.split(' ')[0]}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="text-slate-400">
            Already have an account registered?
          </div>
          <button
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="text-emerald-400 hover:text-emerald-300 font-bold transition flex items-center gap-1"
          >
            <span>Sign In to Existing Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
