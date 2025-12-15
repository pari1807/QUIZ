import { create } from 'zustand';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (credentials) => {
    try {
      set({ loading: true });
      const response = await authAPI.login(credentials);
      const { token, refreshToken, ...user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      set({ user, token, isAuthenticated: true, loading: false });
      toast.success(`Welcome back, ${user.username}!`);
      
      return response.data;
    } catch (error) {
      set({ loading: false });

      const message = error.response?.data?.message;
      const requiresVerification = error.response?.data?.requiresVerification;

      // Agar email verification pending hai to generic login failed toast na dikhayein,
      // taaki Login page usko handle karke verify OTP pe bhej sake.
      if (requiresVerification) {
        toast.error(message || 'Please verify your email first.');
      } else {
        toast.error(message || 'Login failed');
      }

      throw error;
    }
  },

  register: async (userData) => {
    try {
      set({ loading: true });
      const response = await authAPI.register(userData);
      // Backend returns message, userId, email (no tokens yet)
      set({ loading: false });
      toast.success(response.data?.message || 'Registration successful! Please verify your email.');
      
      return response.data; // { message, userId, email }
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  },

  verifyOtp: async ({ userId, otp }) => {
    try {
      set({ loading: true });
      const response = await authAPI.verifyOtp({ userId, otp });
      const { token, refreshToken, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      set({ user, token, isAuthenticated: true, loading: false });
      toast.success(response.data?.message || 'Email verified successfully');

      return response.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'OTP verification failed');
      throw error;
    }
  },

  resendOtp: async (email) => {
    try {
      set({ loading: true });
      const response = await authAPI.resendOtp({ email });
      set({ loading: false });
      toast.success(response.data?.message || 'OTP sent successfully');
      return response.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ user: null, token: null, isAuthenticated: false });
      toast.success('Logged out successfully');
    }
  },

  fetchUser: async () => {
    if (!get().token) return;

    try {
      const response = await authAPI.getMe();
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      console.error('Fetch user error:', error);
      get().logout();
    }
  },

  updateUser: (userData) => {
    set({ user: { ...get().user, ...userData } });
  },
}));

export default useAuthStore;
