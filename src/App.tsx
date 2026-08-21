import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { LoginModal } from './components/auth/LoginModal';
import { SignUpModal } from './components/auth/SignUpModal';
import { RoleSwitcherModal } from './components/common/RoleSwitcherModal';
import { SMSGatewayModal } from './components/common/SMSGatewayModal';
import { PlatformAdminPortal } from './components/portals/PlatformAdminPortal';
import { SchoolAdminPortal } from './components/portals/SchoolAdminPortal';
import { TeacherPortal } from './components/portals/TeacherPortal';
import { StudentPortal } from './components/portals/StudentPortal';
import { ParentPortal } from './components/portals/ParentPortal';
import { BursarPortal } from './components/portals/BursarPortal';
import { LiveClassroomPortal } from './components/portals/LiveClassroomPortal';
import { MoELibraryPortal } from './components/portals/MoELibraryPortal';
import { DatabaseSecurityExplorer } from './components/portals/DatabaseSecurityExplorer';
import { GeminiAISuiteModal } from './components/ai/GeminiAISuiteModal';

const MainAppContent: React.FC = () => {
  const {
    currentUser,
    currentSchool,
    isLandingView,
    setIsLandingView,
    loginModalOpen,
    setLoginModalOpen,
    signUpModalOpen,
    setSignUpModalOpen,
    signUpInitialMode,
    setSignUpInitialMode,
    activeRoleModalOpen,
    setActiveRoleModalOpen,
    smsGatewayModalOpen,
    setSmsGatewayModalOpen,
    aiSuiteModalOpen,
    setAiSuiteModalOpen,
    aiSuiteTab,
  } = useApp();

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>(() => {
    switch (currentUser.role) {
      case 'platform_admin':
        return 'platform_admin';
      case 'school_admin':
        return 'admin_overview';
      case 'teacher':
        return 'teacher_attendance';
      case 'student':
        return 'student_dashboard';
      case 'parent':
        return 'parent_overview';
      case 'bursar':
        return 'bursar_invoices';
      default:
        return 'admin_overview';
    }
  });

  // Keep active tab in sync when currentUser role changes
  useEffect(() => {
    switch (currentUser.role) {
      case 'platform_admin':
        setActiveTab('platform_admin');
        break;
      case 'school_admin':
        setActiveTab('admin_overview');
        break;
      case 'teacher':
        setActiveTab('teacher_analytics');
        break;
      case 'student':
        setActiveTab('student_dashboard');
        break;
      case 'parent':
        setActiveTab('parent_overview');
        break;
      case 'bursar':
        setActiveTab('bursar_invoices');
        break;
      default:
        setActiveTab('admin_overview');
    }
  }, [currentUser.id, currentUser.role]);

  const handleEnterPortal = (tabToOpen?: string) => {
    setIsLandingView(false);
    if (tabToOpen) {
      setActiveTab(tabToOpen);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* If Landing Page View is active */}
      {isLandingView ? (
        <LandingPage
          onEnterPortal={handleEnterPortal}
          onOpenLogin={() => setLoginModalOpen(true)}
          onOpenSignUp={(mode = 'school') => {
            setSignUpInitialMode(mode);
            setSignUpModalOpen(true);
          }}
        />
      ) : (
        <>
          {/* Top Main Navigation */}
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main App Content Viewport */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
            {/* Render Tab based on Selection */}
            {activeTab === 'platform_admin' || activeTab === 'schools_directory' ? (
              <PlatformAdminPortal initialSubTab="tenants" />
            ) : activeTab === 'stripe_saas_billing' ? (
              <PlatformAdminPortal initialSubTab="stripe_gateway" />
            ) : activeTab.startsWith('admin_') ? (
              <SchoolAdminPortal subTab={activeTab} />
            ) : activeTab.startsWith('teacher_') ? (
              activeTab === 'teacher_live' ? (
                <LiveClassroomPortal />
              ) : (
                <TeacherPortal
                  subTab={activeTab}
                  onNavigateToLive={() => setActiveTab('teacher_live')}
                />
              )
            ) : activeTab.startsWith('student_') ? (
              <StudentPortal subTab={activeTab} />
            ) : activeTab.startsWith('parent_') ? (
              <ParentPortal subTab={activeTab} />
            ) : activeTab.startsWith('bursar_') ? (
              <BursarPortal subTab={activeTab} />
            ) : activeTab === 'moe_library' ? (
              <MoELibraryPortal />
            ) : activeTab === 'db_security' ? (
              <DatabaseSecurityExplorer />
            ) : (
              <SchoolAdminPortal subTab="admin_overview" />
            )}
          </main>

          {/* Footer Info Bar */}
          <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-400 py-6 px-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
                  S
                </div>
                <div>
                  <span className="font-bold text-white">Savina Learning Center</span> — Multi-Tenant School Management for Liberia & West Africa
                </div>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                <button
                  onClick={() => setIsLandingView(true)}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  View Public Website & Pricing
                </button>
                <span>•</span>
                <span>Offline-First PWA</span>
                <span>•</span>
                <span>Lonestar MTN & Orange MoMo</span>
                <span>•</span>
                <span>Liberia MoE Curriculum</span>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToSignUp={() => {
          setSignUpInitialMode('member');
          setSignUpModalOpen(true);
        }}
        onSuccessfulLogin={() => {
          setIsLandingView(false);
        }}
      />

      {/* Sign Up / School Onboarding Modal */}
      <SignUpModal
        isOpen={signUpModalOpen}
        initialMode={signUpInitialMode}
        onClose={() => setSignUpModalOpen(false)}
        onSwitchToLogin={() => setLoginModalOpen(true)}
        onSuccessfulSignUp={() => {
          setIsLandingView(false);
        }}
      />

      {/* Role Switcher Modal */}
      {activeRoleModalOpen && (
        <RoleSwitcherModal
          onClose={() => setActiveRoleModalOpen(false)}
          onSelectTab={(tab) => {
            setIsLandingView(false);
            setActiveTab(tab);
          }}
        />
      )}

      {/* SMS Gateway Logs & Dispatcher Modal */}
      {smsGatewayModalOpen && (
        <SMSGatewayModal onClose={() => setSmsGatewayModalOpen(false)} />
      )}

      {/* Gemini & Firebase AI Suite Modal */}
      {aiSuiteModalOpen && (
        <GeminiAISuiteModal
          isOpen={aiSuiteModalOpen}
          initialTab={aiSuiteTab}
          onClose={() => setAiSuiteModalOpen(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
