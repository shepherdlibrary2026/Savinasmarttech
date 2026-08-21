import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  School,
  Lock,
  Mail,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  UserCheck,
  KeyRound,
  Building2,
  PhoneCall,
  Sparkles,
  AlertCircle,
  X,
  Flame,
} from 'lucide-react';
import { UserRole } from '../../types';
import { signInWithGoogle, saveUserToFirestore } from '../../firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onSuccessfulLogin: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignUp,
  onSuccessfulLogin,
}) => {
  const { users, schools, currentSchool, setCurrentSchool, setCurrentUser, switchRole } = useApp();

  const [authMethod, setAuthMethod] = useState<'email' | 'phone_otp' | 'quick_personas'>('quick_personas');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(currentSchool?.id || schools[0]?.id || '');
  const [email, setEmail] = useState<string>('admin@savina.edu.lr');
  const [password, setPassword] = useState<string>('SavinaAdmin2025!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>('+231 77 012 3456');
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [simulatedOtp, setSimulatedOtp] = useState<string>('842910');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        const googleUser = res.user;
        const targetSchool = schools.find((s) => s.id === selectedSchoolId) || schools[0];
        
        // Create or update user profile
        const newUserObj: any = {
          id: googleUser.uid,
          name: googleUser.displayName || googleUser.email?.split('@')[0] || 'Savina Scholar',
          email: googleUser.email || 'user@school.edu.lr',
          role: 'teacher', // Default role for Google Auth or match existing
          schoolId: targetSchool.id,
          avatarUrl: googleUser.photoURL || undefined,
        };

        // Persist to Firestore
        await saveUserToFirestore(newUserObj);

        if (targetSchool) setCurrentSchool(targetSchool);
        setCurrentUser(newUserObj);
        setIsLoading(false);
        onSuccessfulLogin();
        onClose();
      } else {
        setErrorMessage(res.error || 'Google Sign-in was cancelled or encountered an issue.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in with Google.');
      setIsLoading(false);
    }
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      // Find matching user or fallback to school admin
      const matchedUser = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && (!selectedSchoolId || u.schoolId === selectedSchoolId)
      ) || users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || users[1];

      if (selectedSchoolId) {
        const sch = schools.find((s) => s.id === selectedSchoolId);
        if (sch) setCurrentSchool(sch);
      }

      setCurrentUser(matchedUser);
      setIsLoading(false);
      onSuccessfulLogin();
      onClose();
    }, 600);
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 8) {
      setErrorMessage('Please enter a valid Liberia MTN or Orange mobile number.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(generatedOtp);
      setOtpCode(generatedOtp); // Auto-fill for convenience
      setOtpSent(true);
      setIsLoading(false);
    }, 500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      if (otpCode !== simulatedOtp && otpCode !== '123456') {
        setErrorMessage('Invalid 6-digit SMS verification code.');
        setIsLoading(false);
        return;
      }

      // Match parent or student by phone
      const matchedUser = users.find((u) => u.phone && u.phone.includes(phone.replace(/\s+/g, '').slice(-7))) || users.find((u) => u.role === 'parent') || users[0];
      
      if (selectedSchoolId) {
        const sch = schools.find((s) => s.id === selectedSchoolId);
        if (sch) setCurrentSchool(sch);
      }

      setCurrentUser(matchedUser);
      setIsLoading(false);
      onSuccessfulLogin();
      onClose();
    }, 600);
  };

  const handleQuickPersonaSelect = (user: any) => {
    setIsLoading(true);
    setTimeout(() => {
      const sch = schools.find((s) => s.id === user.schoolId) || schools[0];
      if (sch) setCurrentSchool(sch);
      setCurrentUser(user);
      setIsLoading(false);
      onSuccessfulLogin();
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Sign In to <span className="text-emerald-400">Savina OS</span>
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  Secure Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Access your school grades, lesson planners, MoMo fees, and live classrooms.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Method Navigation Tabs */}
        <div className="grid grid-cols-3 bg-slate-950/60 p-2 gap-1 border-b border-slate-800/80 text-xs">
          <button
            onClick={() => setAuthMethod('quick_personas')}
            className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              authMethod === 'quick_personas'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>1-Click Personas</span>
          </button>

          <button
            onClick={() => setAuthMethod('email')}
            className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              authMethod === 'email'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email & Password</span>
          </button>

          <button
            onClick={() => setAuthMethod('phone_otp')}
            className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              authMethod === 'phone_otp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>MTN / Orange OTP</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-3.5 flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Google Sign-In with Firebase Auth */}
          <div className="space-y-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-3 text-xs sm:text-sm border border-slate-200"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google (Firebase Auth)</span>
            </button>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Firestore DB Connected
              </span>
              <span>Encrypted Session</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-medium uppercase tracking-wider">
              Or sign in with
            </span>
          </div>

          {/* School Tenant Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Target School Tenant
              </span>
              <span className="text-[11px] text-slate-400 font-normal">RLS Multi-Tenant Context</span>
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
            >
              {schools.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  {sch.name} — {sch.city}, {sch.county} ({sch.code})
                </option>
              ))}
            </select>
          </div>

          {/* METHOD 1: 1-Click Fast Persona Switcher */}
          {authMethod === 'quick_personas' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Choose a Demo Role Persona:</span>
                <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                  Instant Test Sign-In
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {users.slice(0, 6).map((u) => {
                  const roleBadge =
                    u.role === 'school_admin'
                      ? 'bg-purple-900/50 text-purple-300 border-purple-700'
                      : u.role === 'teacher'
                      ? 'bg-blue-900/50 text-blue-300 border-blue-700'
                      : u.role === 'student'
                      ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700'
                      : u.role === 'parent'
                      ? 'bg-amber-900/50 text-amber-300 border-amber-700'
                      : u.role === 'bursar'
                      ? 'bg-teal-900/50 text-teal-300 border-teal-700'
                      : 'bg-rose-900/50 text-rose-300 border-rose-700';

                  return (
                    <button
                      key={u.id}
                      onClick={() => handleQuickPersonaSelect(u)}
                      disabled={isLoading}
                      className="text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-3 transition flex items-center gap-3 group relative overflow-hidden"
                    >
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700 group-hover:border-emerald-400 transition"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-sm">
                          {u.name[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition">
                          {u.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border ${roleBadge}`}
                          >
                            {u.role.replace('_', ' ')}
                          </span>
                          {u.gradeLevel && (
                            <span className="text-[10px] text-slate-400 truncate">{u.gradeLevel}</span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* METHOD 2: Email & Password */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@school.edu.lr"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  <a href="#reset" onClick={(e) => { e.preventDefault(); alert('In demo mode, use any password to log in.'); }} className="text-[11px] text-emerald-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500" />
                  <span>Remember this device (30 days)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In to School Portal</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* METHOD 3: Phone Number SMS / Mobile OTP */}
          {authMethod === 'phone_otp' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-3 text-amber-200 text-xs flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  Designed for Liberia Mobile Ecosystem. Instant sign-in via <strong>MTN MoMo (+231 77)</strong> or <strong>Orange (+231 88)</strong> SMS OTP.
                </span>
              </div>

              {!otpSent ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Liberian Mobile Phone Number
                    </label>
                    <div className="relative">
                      <PhoneCall className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+231 77 000 0000"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Supports MTN Lonestar Cell & Orange Liberia networks
                    </span>
                  </div>

                  <button
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Send 6-Digit SMS Code</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-300 flex items-center justify-between">
                    <span>SMS sent to <strong>{phone}</strong></span>
                    <span className="bg-emerald-900/80 px-2 py-0.5 rounded font-mono font-bold text-amber-300">
                      Code: {simulatedOtp}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="842910"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center font-mono text-xl tracking-widest text-white focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      Change Phone Number
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      Resend SMS Code
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="text-slate-400">
            Don't have a school account yet?
          </div>
          <button
            onClick={() => {
              onClose();
              onSwitchToSignUp();
            }}
            className="text-emerald-400 hover:text-emerald-300 font-bold transition flex items-center gap-1"
          >
            <span>Register School or Join as Member</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
