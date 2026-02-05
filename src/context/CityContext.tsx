// src/contexts/CityContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CityContextType {
  selectedDistrictId: number | null;
  selectedDistrictName: string;
  setSelectedDistrict: (id: number, name: string) => void;
  clearUserCity: () => void; // Add this to clear user-specific data
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};

interface CityProviderProps {
  children: ReactNode;
}

export const CityProvider: React.FC<CityProviderProps> = ({ children }) => {
  // Get current user ID (if logged in)
  const getCurrentUserId = (): string | null => {
    return localStorage.getItem("EmployeeRefId") || localStorage.getItem("LoginRefId") || "guest";
  };

  // Function to get user-specific storage key
  const getUserCityKey = (key: 'DistrictId' | 'DistrictName'): string => {
    const userId = getCurrentUserId();
    return `${userId}_${key}`;
  };

  // Initialize state from user-specific localStorage
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(() => {
    const userKey = getUserCityKey('DistrictId');
    const stored = localStorage.getItem(userKey);
    return stored ? parseInt(stored) : null;
  });
  
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>(() => {
    const userKey = getUserCityKey('DistrictName');
    return localStorage.getItem(userKey) || "Select Location";
  });

  // Function to update city and persist to user-specific localStorage
  const setSelectedDistrict = (id: number, name: string) => {
    setSelectedDistrictId(id);
    setSelectedDistrictName(name);
    
    // Save to user-specific localStorage
    const userId = getCurrentUserId();
    localStorage.setItem(`${userId}_DistrictId`, id.toString());
    localStorage.setItem(`${userId}_DistrictName`, name);
    
    // Also update global localStorage for backward compatibility
    localStorage.setItem("DistrictId", id.toString());
    localStorage.setItem("DistrictName", name);
    
    // Dispatch a custom event so other components can listen
    window.dispatchEvent(new CustomEvent('cityChanged', {
      detail: { districtId: id, districtName: name }
    }));
  };

  // Function to clear user-specific city data (on logout)
  const clearUserCity = () => {
    const userId = getCurrentUserId();
    localStorage.removeItem(`${userId}_DistrictId`);
    localStorage.removeItem(`${userId}_DistrictName`);
    
    // Reset to defaults
    setSelectedDistrictId(null);
    setSelectedDistrictName("Select Location");
  };

  // Listen for user changes (login/logout)
  useEffect(() => {
    const handleUserChange = () => {
      // When user changes (login/logout), reload city preferences
      const userKeyId = getUserCityKey('DistrictId');
      const userKeyName = getUserCityKey('DistrictName');
      
      const storedId = localStorage.getItem(userKeyId);
      const storedName = localStorage.getItem(userKeyName);
      
      if (storedId) {
        setSelectedDistrictId(parseInt(storedId));
      } else {
        setSelectedDistrictId(null);
      }
      
      if (storedName) {
        setSelectedDistrictName(storedName);
      } else {
        setSelectedDistrictName("Select Location");
      }
    };

    // Listen for storage changes (including login/logout)
    window.addEventListener('storage', handleUserChange);
    
    // Also listen for custom events for user changes
    window.addEventListener('userChanged', handleUserChange);
    
    return () => {
      window.removeEventListener('storage', handleUserChange);
      window.removeEventListener('userChanged', handleUserChange);
    };
  }, []);

  // Also listen for our custom cityChanged event
  useEffect(() => {
    const handleCityChanged = (event: CustomEvent) => {
      const { districtId, districtName } = event.detail;
      if (districtId !== selectedDistrictId) {
        setSelectedDistrictId(districtId);
      }
      if (districtName !== selectedDistrictName) {
        setSelectedDistrictName(districtName);
      }
    };

    window.addEventListener('cityChanged', handleCityChanged as EventListener);
    
    return () => {
      window.removeEventListener('cityChanged', handleCityChanged as EventListener);
    };
  }, [selectedDistrictId, selectedDistrictName]);

  return (
    <CityContext.Provider value={{ 
      selectedDistrictId, 
      selectedDistrictName, 
      setSelectedDistrict,
      clearUserCity 
    }}>
      {children}
    </CityContext.Provider>
  );
};