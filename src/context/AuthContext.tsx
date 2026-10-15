import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, loginWithGoogleRedirect, checkRedirectResult, logoutUser } from '../lib/firebase';

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
  isActualGirlfriend: boolean;
  isAuthorizedEditor: boolean;
  isUnauthorized: boolean;
  canToggleRole: boolean;
  defaultBoyfriendEmail: string;
  defaultGirlfriendEmail: string;
  login: () => Promise<void>;
  loginRedirect: () => Promise<void>;
  logout: () => Promise<void>;
  switchAccount: () => Promise<void>;
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
  quickUnlockBoyfriend: () => void;
  loginWithPasscode: (targetRole: 'boyfriend' | 'girlfriend', pin: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const BOYFRIEND_DEFAULT_EMAIL = 'stew3048@gmail.com';
export const GIRLFRIEND_DEFAULT_EMAIL = 'sng828388@gmail.com';

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  defaultBoyfriendEmail?: string;
  defaultGirlfriendEmail?: string;
}> = ({
  children,
  defaultBoyfriendEmail = BOYFRIEND_DEFAULT_EMAIL,
  defaultGirlfriendEmail = GIRLFRIEND_DEFAULT_EMAIL,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const fastAuth = localStorage.getItem('qingbao_trip_fast_auth');
      if (fastAuth === BOYFRIEND_DEFAULT_EMAIL) {
        return {
          email: BOYFRIEND_DEFAULT_EMAIL,
          displayName: '蔡寶 (管理員)',
          uid: 'boyfriend-admin-auth',
        } as any;
      } else if (fastAuth === GIRLFRIEND_DEFAULT_EMAIL) {
        return {
          email: GIRLFRIEND_DEFAULT_EMAIL,
          displayName: '晴寶 (壽星女主角)',
          uid: 'girlfriend-qingbao-auth',
        } as any;
      }
    } catch (e) {}
    return null;
  });

  const [userEmail, setUserEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem('qingbao_trip_fast_auth') || null;
    } catch (e) {
      return null;
    }
  });
  
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
    let bf = defaultBoyfriendEmail || BOYFRIEND_DEFAULT_EMAIL;
    let gf = defaultGirlfriendEmail || GIRLFRIEND_DEFAULT_EMAIL;
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
    return { 
      bfEmail: bf.trim().toLowerCase(), 
      gfEmail: gf.trim().toLowerCase() 
    };
  };

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser?.email) {
        setUser(currentUser);
        const email = currentUser.email;
        setUserEmail(email);
        const emailLower = email.trim().toLowerCase();
        const { bfEmail, gfEmail } = getTargetEmails();
        
        // Strict equality check ONLY: no loose substring matching
        if (emailLower === bfEmail || emailLower === BOYFRIEND_DEFAULT_EMAIL) {
          // Actual boyfriend (stew3048@gmail.com)
          const savedRole = localStorage.getItem('qingbao_trip_user_role');
          const activeRole: UserRole = savedRole === 'girlfriend' ? 'girlfriend' : 'boyfriend';
          setRoleState(activeRole);
          localStorage.setItem('qingbao_trip_fast_auth', BOYFRIEND_DEFAULT_EMAIL);
        } else if (emailLower === gfEmail || emailLower === GIRLFRIEND_DEFAULT_EMAIL) {
          // Actual girlfriend (sng828388@gmail.com): strictly girlfriend only!
          setRoleState('girlfriend');
          localStorage.setItem('qingbao_trip_user_role', 'girlfriend');
          localStorage.setItem('qingbao_trip_fast_auth', GIRLFRIEND_DEFAULT_EMAIL);
        } else {
          // Unauthorized email logged in: strictly guest, access denied!
          setRoleState('guest');
          localStorage.setItem('qingbao_trip_user_role', 'guest');
          localStorage.removeItem('qingbao_trip_fast_auth');
        }
      } else {
        // If Firebase currentUser is null, check if there is an active local passcode/fast auth session
        const fastAuth = localStorage.getItem('qingbao_trip_fast_auth');
        if (fastAuth === BOYFRIEND_DEFAULT_EMAIL) {
          setUserEmail(BOYFRIEND_DEFAULT_EMAIL);
          setUser({
            email: BOYFRIEND_DEFAULT_EMAIL,
            displayName: '蔡寶 (管理員)',
            uid: 'boyfriend-admin-auth',
          } as any);
          const savedRole = localStorage.getItem('qingbao_trip_user_role');
          setRoleState(savedRole === 'girlfriend' ? 'girlfriend' : 'boyfriend');
        } else if (fastAuth === GIRLFRIEND_DEFAULT_EMAIL) {
          setUserEmail(GIRLFRIEND_DEFAULT_EMAIL);
          setUser({
            email: GIRLFRIEND_DEFAULT_EMAIL,
            displayName: '晴寶 (壽星女主角)',
            uid: 'girlfriend-qingbao-auth',
          } as any);
          setRoleState('girlfriend');
          localStorage.setItem('qingbao_trip_user_role', 'girlfriend');
        } else {
          setUser(null);
          setUserEmail(null);
          setRoleState('guest');
          localStorage.setItem('qingbao_trip_user_role', 'guest');
        }
      }
    });
    return () => unsubscribe();
  }, [defaultBoyfriendEmail, defaultGirlfriendEmail]);

  const { bfEmail, gfEmail } = getTargetEmails();
  const lowerUserEmail = userEmail?.trim().toLowerCase() || '';

  const isLoggedIn = !!user;
  // Strict check: only exact email matches are authorized
  const isActualBoyfriend = isLoggedIn && (lowerUserEmail === bfEmail || lowerUserEmail === BOYFRIEND_DEFAULT_EMAIL);
  const isActualGirlfriend = isLoggedIn && (lowerUserEmail === gfEmail || lowerUserEmail === GIRLFRIEND_DEFAULT_EMAIL);
  const isAuthorizedEditor = isActualBoyfriend || isActualGirlfriend;
  const isUnauthorized = isLoggedIn && !isAuthorizedEditor;

  // Role permissions:
  // - stew3048@gmail.com: can see both boyfriend and girlfriend perspectives
  // - sng828388@gmail.com: can ONLY see girlfriend perspective, cannot switch
  // - unauthorized / guest: neither
  const isBoyfriend = isActualBoyfriend && role === 'boyfriend';
  const isGirlfriend = isActualGirlfriend || (isActualBoyfriend && role === 'girlfriend');
  const isGuest = !isLoggedIn || isUnauthorized;
  const canToggleRole = isActualBoyfriend;

  const setRole = (newRole: UserRole) => {
    // Only stew3048@gmail.com (actual boyfriend / administrator) has permission to switch perspectives!
    if (!isActualBoyfriend) {
      console.warn('Role switch rejected: only stew3048@gmail.com is allowed to toggle perspectives.');
      return;
    }
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
        const emailLower = loggedUser.email.trim().toLowerCase();
        const { bfEmail, gfEmail } = getTargetEmails();

        if (emailLower === bfEmail || emailLower === BOYFRIEND_DEFAULT_EMAIL) {
          const savedRole = localStorage.getItem('qingbao_trip_user_role');
          const activeRole: UserRole = savedRole === 'girlfriend' ? 'girlfriend' : 'boyfriend';
          setRoleState(activeRole);
        } else if (emailLower === gfEmail || emailLower === GIRLFRIEND_DEFAULT_EMAIL) {
          setRoleState('girlfriend');
          localStorage.setItem('qingbao_trip_user_role', 'girlfriend');
        } else {
          setRoleState('guest');
          localStorage.setItem('qingbao_trip_user_role', 'guest');
        }
      }
    } catch (err) {
      console.error('Login failed', err);
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('qingbao_trip_fast_auth');
      await logoutUser();
      setUser(null);
      setUserEmail(null);
      setRoleState('guest');
      localStorage.setItem('qingbao_trip_user_role', 'guest');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleSwitchAccount = async () => {
    try {
      await logoutUser();
      setUser(null);
      setUserEmail(null);
      setRoleState('guest');
      localStorage.setItem('qingbao_trip_user_role', 'guest');
      // Prompt Google account selection
      await handleLogin();
    } catch (err) {
      console.error('Switch account failed', err);
    }
  };

  const quickUnlockBoyfriend = () => {
    loginWithPasscode('boyfriend', '0907');
  };

  const loginWithPasscode = (targetRole: 'boyfriend' | 'girlfriend', pin: string): { success: boolean; error?: string } => {
    const trimmed = pin.trim();
    if (!trimmed) {
      return { success: false, error: '請輸入專屬通關密碼' };
    }

    // Role-specific passcodes:
    // 蔡寶: 0907
    // 晴寶: 1017
    if (targetRole === 'boyfriend') {
      if (trimmed !== '0907') {
        return { success: false, error: '蔡寶專屬密碼錯誤，請重新確認後再試！' };
      }
    } else {
      if (trimmed !== '1017') {
        return { success: false, error: '晴寶專屬密碼錯誤，請重新確認後再試！' };
      }
    }

    if (targetRole === 'boyfriend') {
      const email = BOYFRIEND_DEFAULT_EMAIL;
      setUserEmail(email);
      setUser({
        email,
        displayName: '蔡寶 (管理員)',
        uid: 'boyfriend-admin-auth',
      } as any);
      setRoleState('boyfriend');
      localStorage.setItem('qingbao_trip_user_role', 'boyfriend');
      localStorage.setItem('qingbao_trip_fast_auth', email);
      closeLoginModal();
      return { success: true };
    } else {
      const email = GIRLFRIEND_DEFAULT_EMAIL;
      setUserEmail(email);
      setUser({
        email,
        displayName: '晴寶 (壽星女主角)',
        uid: 'girlfriend-qingbao-auth',
      } as any);
      setRoleState('girlfriend');
      localStorage.setItem('qingbao_trip_user_role', 'girlfriend');
      localStorage.setItem('qingbao_trip_fast_auth', email);
      closeLoginModal();
      return { success: true };
    }
  };

  useEffect(() => {
    const fastAuth = localStorage.getItem('qingbao_trip_fast_auth');
    if (fastAuth && !user) {
      if (fastAuth === BOYFRIEND_DEFAULT_EMAIL) {
        setUserEmail(BOYFRIEND_DEFAULT_EMAIL);
        setUser({
          email: BOYFRIEND_DEFAULT_EMAIL,
          displayName: '蔡寶 (管理員)',
          uid: 'boyfriend-admin-auth',
        } as any);
        const savedRole = localStorage.getItem('qingbao_trip_user_role');
        setRoleState(savedRole === 'girlfriend' ? 'girlfriend' : 'boyfriend');
      } else if (fastAuth === GIRLFRIEND_DEFAULT_EMAIL) {
        setUserEmail(GIRLFRIEND_DEFAULT_EMAIL);
        setUser({
          email: GIRLFRIEND_DEFAULT_EMAIL,
          displayName: '晴寶 (壽星女主角)',
          uid: 'girlfriend-qingbao-auth',
        } as any);
        setRoleState('girlfriend');
      }
    }
  }, []);

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

  // Gatekeeper helper
  const requireAuthOrPrompt = (actionReason?: string): boolean => {
    if (isAuthorizedEditor) {
      return true;
    }
    openLoginModal(actionReason || '修改內容或同步至雲端資料庫');
    return false;
  };

  const handleLoginRedirect = async () => {
    try {
      await loginWithGoogleRedirect();
    } catch (err) {
      console.error('Login redirect failed', err);
      throw err;
    }
  };

  useEffect(() => {
    checkRedirectResult().then((redirectedUser) => {
      if (redirectedUser?.email) {
        setUser(redirectedUser);
        setUserEmail(redirectedUser.email);
        const emailLower = redirectedUser.email.trim().toLowerCase();
        const { bfEmail, gfEmail } = getTargetEmails();
        if (emailLower === bfEmail || emailLower === BOYFRIEND_DEFAULT_EMAIL) {
          const savedRole = localStorage.getItem('qingbao_trip_user_role');
          const activeRole: UserRole = savedRole === 'girlfriend' ? 'girlfriend' : 'boyfriend';
          setRoleState(activeRole);
        } else if (emailLower === gfEmail || emailLower === GIRLFRIEND_DEFAULT_EMAIL) {
          setRoleState('girlfriend');
          localStorage.setItem('qingbao_trip_user_role', 'girlfriend');
        } else {
          setRoleState('guest');
          localStorage.setItem('qingbao_trip_user_role', 'guest');
        }
      }
    }).catch(err => {
      console.warn('Redirect check notice:', err);
    });
  }, []);

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
        isActualGirlfriend,
        isAuthorizedEditor,
        isUnauthorized,
        canToggleRole,
        defaultBoyfriendEmail,
        defaultGirlfriendEmail,
        login: handleLogin,
        loginRedirect: handleLoginRedirect,
        logout: handleLogout,
        switchAccount: handleSwitchAccount,
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
        requireAuthOrPrompt,
        quickUnlockBoyfriend,
        loginWithPasscode
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

