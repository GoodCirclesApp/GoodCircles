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
          // Race-condition guard: if the user logged in while this request was
          // in flight, a new token has replaced the stale one — don't sign out.
          const currentToken = localStorage.getItem('gc_auth_token');
          if (currentToken === token) {
            // Only sign out for auth errors (token truly invalid/expired).
            // Server errors (5xx from e.g. DB issues) should not clear a
            // potentially valid token — the user can still log in fresh.
            const msg = String((error as any)?.message || '');
            const isAuthError = /status (401|403)|Session expired|Unauthorized/i.test(msg);
            if (isAuthError) {
              authService.logout();
              setCurrentUser(null);
            }
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      const { user, token, refreshToken } = await authService.login(email, password);
      setCurrentUser(user);
      localStorage.setItem('gc_auth_token', token);
      if (refreshToken) localStorage.setItem('gc_refresh_token', refreshToken);
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
