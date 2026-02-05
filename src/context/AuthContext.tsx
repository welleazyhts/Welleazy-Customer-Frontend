import React, { createContext, useContext, useEffect, useState } from "react";
import { DependantsAPI } from "../api/dependants";


interface User {
  displayName: string;
  loginRefId: number;
  employeeRefId: number;
  corporateId: number;
  memberId?: string;
  loginType?: number;
  corporateName?: string;
   hasPersonalEmail?: boolean; // this flag
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
  login: () => {},
  logout: () => {},
  loading: false,
    needsProfileCompletion: false,
  setProfileCompleted: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Ensure loginRefId is a number
        if (parsedUser.loginRefId) {
          parsedUser.loginRefId = Number(parsedUser.loginRefId);
        }
        // Check if profile needs completion
          const hasProfileCompleted = localStorage.getItem("profileCompleted") === "true";
        parsedUser.hasPersonalEmail = hasProfileCompleted;

        return parsedUser;
      }
      return null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
 const [needsProfileCompletion, setNeedsProfileCompletion] = useState(() => {
    return localStorage.getItem("needsProfileCompletion") === "true";
  });

   const login = (data: any) => {
    const loggedInUser: User = {
      displayName: data.DisplayName,
      loginRefId: Number(data.LoginRefId), // Ensure it's a number
      employeeRefId: Number(data.EmployeeRefId),
      corporateId: Number(data.CorporateId),
      memberId: data.MemberId,
      loginType: Number(data.LoginType),
      corporateName: data.CorporateName,
       hasPersonalEmail: data.hasPersonalEmail || false,
    };

   console.log('Logging in user with loginRefId:', loggedInUser.loginRefId);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    // Check if profile needs completion (you might want to fetch this from API)
    // For now, we'll check localStorage flag
    const needsCompletion = localStorage.getItem("needsProfileCompletion") === "true";
    setNeedsProfileCompletion(needsCompletion);

    setUser(loggedInUser);
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
    localStorage.setItem("needsProfileCompletion", "false");
    setNeedsProfileCompletion(false);
    if (user) {
      const updatedUser = { ...user, hasPersonalEmail: true };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

   // Check profile completion status on mount
  useEffect(() => {
    if (user) {
      // You might want to fetch profile status from API here
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
