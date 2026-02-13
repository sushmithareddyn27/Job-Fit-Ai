import { useState } from 'react';
import { LandingPage } from '@/app/components/LandingPage';
import { JobSeekerProfileSetup } from '@/app/components/JobSeekerProfileSetup';
import { RecruiterProfileSetup } from '@/app/components/RecruiterProfileSetup';
import { JobSeekerDashboard } from '@/app/components/JobSeekerDashboard';
import { RecruiterDashboard } from '@/app/components/RecruiterDashboard';
import { mockJobSeekerProfile, mockRecruiterProfile } from '@/app/data/mockData';
import type { UserType, JobSeekerProfile, RecruiterProfile } from '@/app/types';
import type { AuthRole, AuthSession, AuthUser } from '@/app/auth/types';
import { getCurrentSession, logout as authLogout } from '@/app/auth/authService';
import { getProfileCompleted, setProfileCompleted } from '@/app/auth/storage';
import { AuthLayout } from '@/app/components/auth/AuthLayout';
import { LoginForm } from '@/app/components/auth/LoginForm';
import { SignupForm } from '@/app/components/auth/SignupForm';

export default function App() {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [jobSeekerProfile, setJobSeekerProfile] = useState<JobSeekerProfile | null>(null);
  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile | null>(null);

  type AuthScreen =
    | { view: 'landing' }
    | { view: 'login'; role: AuthRole }
    | { view: 'signup'; role: AuthRole };

  const [auth, setAuth] = useState<{ session: AuthSession | null; screen: AuthScreen }>(() => {
    const session = getCurrentSession();
    return {
      session,
      screen: { view: 'landing' }
    };
  });

  const handleAuthSuccess = (session: AuthSession) => {
    setAuth({ session, screen: { view: 'landing' } });
    setUserType(session.user.role);
    const completed = getProfileCompleted(session.user.role, session.user.email);
    setHasProfile(completed);
    if (completed) {
      // Returning user: load demo profile and go straight to dashboard.
      if (session.user.role === 'jobseeker') {
        setJobSeekerProfile(mockJobSeekerProfile);
      } else {
        setRecruiterProfile(mockRecruiterProfile);
      }
    } else {
      // First login: force profile setup.
      setJobSeekerProfile(null);
      setRecruiterProfile(null);
    }
  };

  const handleSignupSuccess = async (_user: AuthUser) => {
    // After signup, switch to login for that role.
    setAuth((prev) => {
      if (prev.screen.view === 'signup') return { ...prev, screen: { view: 'login', role: prev.screen.role } };
      return prev;
    });
  };

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
  };

  const handleDemoMode = (type: UserType) => {
    setUserType(type);
    if (type === 'jobseeker') {
      setJobSeekerProfile(mockJobSeekerProfile);
    } else {
      setRecruiterProfile(mockRecruiterProfile);
    }
    setHasProfile(true);
  };

  const handleJobSeekerProfileComplete = (profile: JobSeekerProfile) => {
    setJobSeekerProfile(profile);
  if (auth.session) setProfileCompleted('jobseeker', auth.session.user.email, true);
    setHasProfile(true);
  };

  const handleRecruiterProfileComplete = (profile: RecruiterProfile) => {
    setRecruiterProfile(profile);
  if (auth.session) setProfileCompleted('recruiter', auth.session.user.email, true);
    setHasProfile(true);
  };

  const handleLogout = () => {
    authLogout();
    setAuth({ session: null, screen: { view: 'landing' } });
    setUserType(null);
    setHasProfile(false);
    setJobSeekerProfile(null);
    setRecruiterProfile(null);
  };

  // If a persisted session exists, use it.
  if (!userType && auth.session) {
    setUserType(auth.session.user.role);
    const completed = getProfileCompleted(auth.session.user.role, auth.session.user.email);
    setHasProfile(completed);
    if (completed) {
      if (auth.session.user.role === 'jobseeker') {
        setJobSeekerProfile(mockJobSeekerProfile);
      } else {
        setRecruiterProfile(mockRecruiterProfile);
      }
    }
  }

  // Auth screens
  if (auth.screen.view === 'login') {
    const role = auth.screen.role;
    return (
      <AuthLayout
        role={role}
        title="Welcome back"
        subtitle={`Log in as a ${role === 'jobseeker' ? 'job seeker' : 'recruiter'}.`}
      >
        <LoginForm
          role={role}
          onSuccess={handleAuthSuccess}
          onGoToSignup={() => setAuth((prev) => ({ ...prev, screen: { view: 'signup', role } }))}
        />
      </AuthLayout>
    );
  }

  if (auth.screen.view === 'signup') {
    const role = auth.screen.role;
    return (
      <AuthLayout
        role={role}
        title="Create your account"
        subtitle={`Sign up as a ${role === 'jobseeker' ? 'job seeker' : 'recruiter'}.`}
      >
        <SignupForm
          role={role}
          onSuccess={handleSignupSuccess}
          onGoToLogin={() => setAuth((prev) => ({ ...prev, screen: { view: 'login', role } }))}
        />
      </AuthLayout>
    );
  }

  // Landing page
  if (!userType) {
    return (
      <LandingPage
        onSelectUserType={handleUserTypeSelect}
        onDemoMode={handleDemoMode}
        onLogin={(role) => setAuth((prev) => ({ ...prev, screen: { view: 'login', role } }))}
        onSignup={(role) => setAuth((prev) => ({ ...prev, screen: { view: 'signup', role } }))}
      />
    );
  }

  // Profile setup
  if (!hasProfile) {
    if (userType === 'jobseeker') {
      return <JobSeekerProfileSetup onComplete={handleJobSeekerProfileComplete} />;
    } else {
      return <RecruiterProfileSetup onComplete={handleRecruiterProfileComplete} />;
    }
  }

  // Dashboard
  if (userType === 'jobseeker' && jobSeekerProfile) {
    return <JobSeekerDashboard profile={jobSeekerProfile} onLogout={handleLogout} />;
  }

  if (userType === 'recruiter' && recruiterProfile) {
    return <RecruiterDashboard profile={recruiterProfile} onLogout={handleLogout} />;
  }

  return (
    <div className="size-full flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}