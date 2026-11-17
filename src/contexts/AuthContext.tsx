import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'client' | 'auditor' | 'admin';

interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('ai_audit_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, role: UserRole) => {
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      email,
      role,
      name: email.split('@')[0],
      company: role === 'client' ? 'Клиентская компания' : undefined
    };
    setUser(newUser);
    localStorage.setItem('ai_audit_user', JSON.stringify(newUser));
  };

  const setRole = (newRole: UserRole) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, role: newRole };
      localStorage.setItem('ai_audit_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ai_audit_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
