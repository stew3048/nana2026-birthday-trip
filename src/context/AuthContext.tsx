import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser } from '../lib/firebase';

export type UserRole = 'boyfriend' | 'girlfriend' | 'guest';

interface AuthContextType {
  user: User | null;
  userEmail: string | null;
  role: UserRole;
  isLoggedIn: boolean;
  isGuest: boolean;
  isBoyfriend: boolean;
  isGirlfriend: boolean;
  isActualBoyfriend: boolean;
  isAuthorizedEditor: boolean;
  defaultBoyfriendEmail: string;
  defaultGirlfriendEmail: string;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  // Simulated Time Engine for previewing time-locked itinerary
  simulatedTime: string | null; // ISO string or null for real-time
  effectiveTime: Date; // The active time to evaluate unlocks against
  setSimulatedTime: (isoString: string | null) => void;
  // Force reveal all toggle for boyfriend preview
  boyfriendForceUnlockAll: boolean;
  setBoyfriendForceUnlockAll: (val: boolean) => void;
  // Interception prompt for guests
  isLoginModalOpen: boolean;
  loginModalReason: string | undefined;
  openLoginModal: (reason?: string) => void;
  closeLoginModal: () => void;
  requireAuthOrPrompt: (actionReason?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BOYFRIEND_DEFAULT_EMAIL = 'stew3048@gmail.com';
const GIRLFRIEND_DEFAULT_EMAIL = 'sng828388@gmail.com';

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  defaultBoyfriendEmail?: string;
  defaultGirlfriendEmail?: string;
}> = ({
  children,
  defaultBoyfriendEmail = BOYFRIEND_DEFAULT_EMAIL,
  defaultGirlfriendEmail = GIRLFRIEND_DEFAULT_EMAIL,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Login Interception Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalReason, setLoginModalReason] = useState<string | undefined>(undefined);

  // Active role based on auth or preview
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('qingbao_trip_user_role');
    return (saved === 'girlfriend' || saved === 'boyfriend' || saved === 'guest') ? (saved as UserRole) : 'guest';
  });

  // Simulated Time for testing 1-hour prior unlock
  const [simulatedTime, setSimulatedTimeState] = useState<string | null>(() => {
    return localStorage.getItem('qingbao_trip_sim_time') || null;
  });

  const [boyfriendForceUnlockAll, setBoyfriendForceUnlockAll] = useState<boolean>(false);

  // Helper to get active configured boyfriend and girlfriend emails
  const getTargetEmails = () => {
    let bf = defaultBoyfriendEmail;
    let gf = defaultGirlfriendEmail;
    try {
      const tripSaved = localStorage.getItem('my_girlfriend_birthday_trip_tainan_v2');
      if (tripSaved) {
        const parsed = JSON.parse(tripSaved);
        if (parsed?.settings?.boyfriendEmail) bf = parsed.settings.boyfriendEmail;
        if (parsed?.settings?.girlfriendEmail) gf = parsed.settings.girlfriendEmail;
      }
    } catch (e) {
      // ignore
    }
    return { bfEmail: bf.toLowerCase(), gfEmail: gf.toLowerCase() };
  };

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        const email = currentUser.email;
        setUserEmail(email);
        const emailLower = email.toLowerCase();
        const { bfEmail, gfEmail } = getTargetEmails();
        
        if (emailLower === bfEmail || emailLower === 'stew3048@gmail.com' || emailLower.includes('stew') || emailLower.includes('cai')) {
          setRoleState('boyfriend');
          localStorage.setItem('qingbao_trip_user_role', 'boyfriend');
        } else if (emailLower === gfEmail || emailLower === 'sng828388@gmail.com') {
          setRoleState('girlfriend');
          localStorage.setItem('qingbao_trip_user_role', 'girlfriend');
        } else {
          // Logged in with an un-whitelisted email
          setRoleState('guest');
          localStorage.setItem('qingbao_trip_user_role', 'guest');
        }
      } else {
        setUserEmail(null);
        setRoleState('guest');
        localStorage.setItem('qingbao_trip_user_role', 'guest');
      }
    });
    return () => unsubscribe();
  }, [defaultBoyfriendEmail, defaultGirlfriendEmail]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('qingbao_trip_user_role', newRole);
  };

  const setSimulatedTime = (isoString: string | null) => {
    setSimulatedTimeState(isoString);
    if (isoString) {
      localStorage.setItem('qingbao_trip_sim_time', isoString);
    } else {
      localStorage.removeItem('qingbao_trip_sim_time');
    }
  };

  const handleLogin = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser?.email) {
        setUser(loggedUser);
        setUserEmail(loggedUser.email);
      }
    } catch (err) {
      console.error('Login failed', err);
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setUserEmail(null);
      setRoleState('guest');
      localStorage.setItem('qingbao_trip_user_role', 'guest');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const openLoginModal = (reason?: string) => {
    setLoginModalReason(reason);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginModalReason(undefined);
  };

  // Real-time clock for calculating unlock status
  const [currentRealTime, setCurrentRealTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentRealTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const effectiveTime = simulatedTime ? new Date(simulatedTime) : currentRealTime;

  const { bfEmail, gfEmail } = getTargetEmails();
  const lowerUserEmail = userEmail?.toLowerCase() || '';

  const isLoggedIn = !!user;
  const isActualBoyfriend = isLoggedIn && (lowerUserEmail === bfEmail || lowerUserEmail === 'stew3048@gmail.com' || lowerUserEmail.includes('stew'));
  const isActualGirlfriend = isLoggedIn && (lowerUserEmail === gfEmail || lowerUserEmail === 'sng828388@gmail.com');
  
  // If boyfriend toggles to girlfriend view, isBoyfriend becomes false so UI reflects exactly what girlfriend sees!
  const isBoyfriend = isActualBoyfriend ? role === 'boyfriend' : (role === 'boyfriend' || (role !== 'girlfriend' && !isActualGirlfriend));
  const isGirlfriend = isActualGirlfriend || (isActualBoyfriend && role === 'girlfriend') || (!isLoggedIn && role === 'girlfriend');
  const isGuest = !isLoggedIn && role !== 'boyfriend' && role !== 'girlfriend';
  const isAuthorizedEditor = isActualBoyfriend || isActualGirlfriend;

  // Gatekeeper helper
  const requireAuthOrPrompt = (actionReason?: string): boolean => {
    if (isAuthorizedEditor) {
      return true;
    }
    openLoginModal(actionReason || '修改內容或同步至雲端資料庫');
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userEmail,
        role: isGuest ? 'guest' : role,
        isLoggedIn,
        isGuest,
        isBoyfriend,
        isGirlfriend,
        isActualBoyfriend,
        isAuthorizedEditor,
        defaultBoyfriendEmail,
        defaultGirlfriendEmail,
        login: handleLogin,
        logout: handleLogout,
        setRole,
        simulatedTime,
        effectiveTime,
        setSimulatedTime,
        boyfriendForceUnlockAll,
        setBoyfriendForceUnlockAll,
        isLoginModalOpen,
        loginModalReason,
        openLoginModal,
        closeLoginModal,
        requireAuthOrPrompt
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

