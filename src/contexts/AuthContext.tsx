'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

const PIN_STORAGE_KEY = 'service_logger_pin';
const AUTH_STORAGE_KEY = 'service_logger_authenticated';
const DEFAULT_PIN = '1234';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  setNewPin: (newPin: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pinRef = useRef<string>(DEFAULT_PIN);
  const hydratedRef = useRef(false);

  // Load initial state from localStorage
  useEffect(() => {
    if (hydratedRef.current) {
      return;
    }

    hydratedRef.current = true;

    const hydrate = () => {
      const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
      const authStatus = localStorage.getItem(AUTH_STORAGE_KEY) === 'true';

      if (storedPin && /^\d{4}$/.test(storedPin)) {
        pinRef.current = storedPin;
      }

      if (authStatus) {
        setIsAuthenticated(true);
      }

      setIsLoading(false);
    };

    if (typeof queueMicrotask === 'function') {
      queueMicrotask(hydrate);
    } else {
      Promise.resolve().then(hydrate);
    }
  }, []);

  const login = (enteredPin: string): boolean => {
    if (isLoading) {
      return false;
    }

    // Use the stored PIN or default to '1234' if none is set
    const correctPin = pinRef.current || DEFAULT_PIN;
    const sanitizedPin = enteredPin.trim();
    
    if (sanitizedPin === correctPin) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(AUTH_STORAGE_KEY, 'false');
  };

  // Function to set a new PIN
  const setNewPin = (newPin: string) => {
    const sanitizedPin = newPin.trim();

    if (!/^\d{4}$/.test(sanitizedPin)) {
      throw new Error('PIN must be exactly 4 digits.');
    }

    pinRef.current = sanitizedPin;
    localStorage.setItem(PIN_STORAGE_KEY, sanitizedPin);
    // Force re-authentication with the new PIN
    setIsAuthenticated(false);
    localStorage.setItem(AUTH_STORAGE_KEY, 'false');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, setNewPin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}