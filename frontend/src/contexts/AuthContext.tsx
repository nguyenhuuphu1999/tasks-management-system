import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { toast } from 'sonner';
import { loginUser, registerUser } from '@/services/taskService';
import apiClient from '@/api/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (username: string, email: string, password: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');

      if (savedUser && token) {
        try {
          const response = await apiClient.get('/auth/me'); 
          const apiUser = response.data.data;

          const userObject: User = {
            id: apiUser.id,
            username: apiUser.username || apiUser.userName || apiUser.email.split('@')[0],
            email: apiUser.email,
            role: apiUser.isAdmin ? 'admin' : 'user',
          };
          setUser(userObject);
          localStorage.setItem('user', JSON.stringify(userObject));
        } catch (err) {
          console.warn('Invalid or expired token, clearing localStorage:', err);
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);
  
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      
      const { user: apiUser, token } = await loginUser(email, password);
      
      // Only proceed if login was successful
      if (!apiUser || !token) {
        throw new Error('Invalid response from server');
      }
      
      // Convert API user to our User type
      const userObject: User = {
        id: apiUser.id || '',
        username: apiUser.username || apiUser.userName || email.split('@')[0],
        email: apiUser.email || email,
        role: apiUser.isAdmin ? 'admin' : 'user',
      };
      
      setUser(userObject);
      localStorage.setItem('user', JSON.stringify(userObject));
      if (token) {
        localStorage.setItem('authToken', token);
      }
      toast.success(`Successfully logged in as ${userObject.role === 'admin' ? 'administrator' : 'user'}`);
      return userObject; // Return user object to indicate successful login
      
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Login failed: ${error.message}`);
      } else {
        toast.error('Login failed');
      }
      throw error; // Re-throw the error to be caught in the login component
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (username: string, email: string, password: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      
      const { user: apiUser, token } = await registerUser(username, email, password);
      
      // Only proceed if registration was successful
      if (!apiUser || !token) {
        throw new Error('Invalid response from server');
      }
      
      // Convert API user to our User type
      const userObject: User = {
        id: apiUser.id || '',
        username: apiUser.username || apiUser.userName || username,
        email: apiUser.email || email,
        role: apiUser.isAdmin ? 'admin' : 'user',
      };
      
      setUser(userObject);
      localStorage.setItem('user', JSON.stringify(userObject));
      if (token) {
        localStorage.setItem('authToken', token);
      }
      toast.success('Account created successfully');
      return userObject; // Return user object to indicate successful registration
      
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Registration failed: ${error.message}`);
      } else {
        toast.error('Registration failed');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    toast.success('Successfully logged out');
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
