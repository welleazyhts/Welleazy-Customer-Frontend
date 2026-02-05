// context/index.tsx
import React from 'react';
import { AuthProvider } from './AuthContext';
import { AppProvider } from './AppContext';

// Export providers individually
export { AuthProvider, AppProvider };

// Export hooks
export { useAuth } from './AuthContext';
export { useApp } from './AppContext';

// Combined provider component
interface CombinedProviderProps {
  children: React.ReactNode;
}

export const CombinedProvider: React.FC<CombinedProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </AuthProvider>
  );
};

// Default export
export default CombinedProvider;