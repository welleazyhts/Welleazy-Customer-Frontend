import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  displayName: string;
  loginRefId: number;
  employeeRefId: number;
  corporateId: number;
  memberId?: string;
  loginType?: number;
  corporateName?: string;
  hasPersonalEmail?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: any) => void;
  logout: () => void;
  loading: boolean;
  needsProfileCompletion: boolean;
  setProfileCompleted: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => { },
  logout: () => { },
  loading: true,
  needsProfileCompletion: false,
  setProfileCompleted: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  const login = (data: any) => {
    const loggedInUser: User = {
      displayName: data.DisplayName || data.display_name,
      loginRefId: Number(data.LoginRefId || data.login_ref_id),
      employeeRefId: Number(data.EmployeeRefId || data.employee_ref_id),
      corporateId: Number(data.CorporateId || data.corporate_id),
      memberId: data.MemberId || data.member_id,
      loginType: Number(data.LoginType || data.login_type),
      corporateName: data.CorporateName || data.corporate_name,
      hasPersonalEmail: data.hasPersonalEmail || false,
    };

    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    const needsCompletion = localStorage.getItem("needsProfileCompletion") === "true";
    setNeedsProfileCompletion(needsCompletion);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("needsProfileCompletion");
    localStorage.removeItem("profileCompleted");
    setUser(null);
    setNeedsProfileCompletion(false);
  };

  const setProfileCompleted = () => {
    localStorage.setItem("profileCompleted", "true");
    setNeedsProfileCompletion(false);
    if (user) {
      const updatedUser = { ...user, hasPersonalEmail: true };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // Check session on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Sync profile completion status
  useEffect(() => {
    if (user) {
      const profileCompleted = localStorage.getItem("profileCompleted") === "true";
      setNeedsProfileCompletion(!profileCompleted);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
        needsProfileCompletion,
        setProfileCompleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
