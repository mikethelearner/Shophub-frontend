import { create } from 'zustand';
import { login as loginApi, register as registerApi } from '@/lib/api';

interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setUser: (userData: any) => void;
}

const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email: string, password: string) => {
    try {
      console.log('Calling login API with:', { email });
      const response = await loginApi(email, password);
      console.log('Login API response:', response);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
        });
      } else {
        console.error('No token received in login response');
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Login error in useAuth:', error);
      throw error;
    }
  },

  register: async (userData: any) => {
    try {
      console.log('Calling register API with:', { ...userData, password: '***' });
      const response = await registerApi(userData);
      console.log('Register API response:', response);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
        });
      } else {
        console.error('No token received in register response');
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Register error in useAuth:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  setUser: (userData: any) => {
    set({
      user: userData
    });
  }
}));

export default useAuth; 