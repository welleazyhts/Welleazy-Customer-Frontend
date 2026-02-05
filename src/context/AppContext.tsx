// context/AppContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define types for app state
export interface AppState {
  theme: 'light' | 'dark';
  language: string;
  notifications: Notification[];
  sidebarOpen: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

export interface AppContextType {
  appState: AppState;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  toggleSidebar: () => void;
  clearAllNotifications: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Props interface for AppProvider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({
    theme: 'light',
    language: 'en',
    notifications: [],
    sidebarOpen: false
  });

  const setTheme = (theme: 'light' | 'dark') => {
    setAppState(prev => ({
      ...prev,
      theme
    }));
    // Save to localStorage
    localStorage.setItem('theme', theme);
  };

  const setLanguage = (language: string) => {
    setAppState(prev => ({
      ...prev,
      language
    }));
    localStorage.setItem('language', language);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };

    setAppState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }));
  };

  const removeNotification = (id: string) => {
    setAppState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(notification => notification.id !== id)
    }));
  };

  const clearAllNotifications = () => {
    setAppState(prev => ({
      ...prev,
      notifications: []
    }));
  };

  const toggleSidebar = () => {
    setAppState(prev => ({
      ...prev,
      sidebarOpen: !prev.sidebarOpen
    }));
  };

  // Load saved preferences on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const savedLanguage = localStorage.getItem('language');

    if (savedTheme) {
      setAppState(prev => ({ ...prev, theme: savedTheme }));
    }
    if (savedLanguage) {
      setAppState(prev => ({ ...prev, language: savedLanguage }));
    }
  }, []);

  const value: AppContextType = {
    appState,
    setTheme,
    setLanguage,
    addNotification,
    removeNotification,
    toggleSidebar,
    clearAllNotifications
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};