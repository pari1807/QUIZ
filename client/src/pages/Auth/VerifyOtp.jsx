import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, loading } = useAuthStore();

  const { userId, email } = location.state || {};

  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;
    try {
      const data = await verifyOtp({ userId, otp });
      const role = data.user?.role;
      if (role === 'admin' || role === 'teacher' || data.user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // toast handled in store
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await resendOtp(email);
    } catch (error) {
      // toast handled in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card max-w-md w-full mx-4 relative z-10 backdrop-blur-sm bg-dark-100/90"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
            Verify Your Email
          </h2>
          <p className="text-dark-500 mt-2">
            Enter the OTP sent to <span className="font-semibold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-700">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input-field tracking-widest text-center text-lg"
              placeholder="123456"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="w-full mt-4 text-sm text-primary-500 hover:text-primary-400 font-semibold"
        >
          Resend OTP
        </button>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
