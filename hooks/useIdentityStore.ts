import { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';
import { WelcomeEmailService } from '../services/welcomeEmailService';

export function useIdentityStore() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonationRole, setImpersonationRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('gc_auth_token');
      
      if (token) {
        try {
          const profile = await authService.getProfile();
          setCurrentUser(profile);
          localStorage.setItem('gc_session_user', JSON.stringify(profile));
        } catch (error) {
          console.error('Session verification failed:', error);
          authService.logout();
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      const { user, token } = await authService.login(email, password);
      setCurrentUser(user);
      localStorage.setItem('gc_auth_token', token);
      localStorage.setItem('gc_session_user', JSON.stringify(user));
      
      // FIXED: Use startSequence instead of checkPendingEmails
      if (user) {
        WelcomeEmailService.startSequence({
          id: user.id,
          email: user.email,
          firstName: user.name?.split(' ')[0],
          role: user.role
        });
      }
      
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setImpersonationRole(null);
  };

  const updateUser = async (updated: Partial<User>) => {
    try {
      const newUser = await authService.updateProfile(updated);
      setCurrentUser(newUser);
      localStorage.setItem('gc_session_user', JSON.stringify(newUser));
      return newUser;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  };

  const effectiveRole = impersonationRole || currentUser?.role;

  return {
    currentUser,
    impersonationRole,
    setImpersonationRole,
    effectiveRole,
    login,
    logout,
    updateUser,
    isLoading
  };
}
