import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, userApi } from '../services/api';
import { type User } from '../services/api';
import { toast } from 'react-toastify';
import { initializeNotifications, setupForegroundMessageListener, notificationService } from '../services/notificationService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (userData: {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    bio?: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationListener, setNotificationListener] = useState<(() => void) | null>(null);

  const isAuthenticated = !!user;

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await userApi.getCurrentUser();
          if (response.success) {
            setUser(response.data);
            // Initialize notifications for authenticated user
            await initializeNotifications(response.data.id);
            // Setup foreground message listener
            const unsubscribe = setupForegroundMessageListener();
            setNotificationListener(() => unsubscribe);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ username, password });

      if (response.success) {
        setUser(response.data);
        // Initialize notifications for logged in user
        await initializeNotifications(response.data.id);
        // Setup foreground message listener
        const unsubscribe = setupForegroundMessageListener();
        setNotificationListener(() => unsubscribe);
        toast.success('Login successful!');
        return true;
      } else {
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    bio?: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.signup(userData);

      if (response.success) {
        toast.success('Account created successfully! Please log in.');
        return true;
      } else {
        toast.error(response.message || 'Signup failed');
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (user) {
      // Clean up notifications
      await notificationService.deleteToken();
      if (notificationListener) {
        notificationListener();
        setNotificationListener(null);
      }
    }
    authApi.logout();
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await userApi.updateProfile(userData);

      if (response.success) {
        setUser(response.data);
        toast.success('Profile updated successfully!');
        return true;
      } else {
        toast.error(response.message || 'Update failed');
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await userApi.getCurrentUser();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Please log in to access this page.</div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// Hook for optional authentication (doesn't redirect if not authenticated)
export const useOptionalAuth = () => {
  const context = useContext(AuthContext);
  return context || { user: null, isLoading: false, isAuthenticated: false };
};
