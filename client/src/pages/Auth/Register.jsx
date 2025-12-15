import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
  });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register(formData);
      navigate('/verify-otp', { state: { userId: data.userId, email: data.email } });
    } catch (error) {
      // Error handled by store
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card max-w-md w-full mx-4 relative z-10 backdrop-blur-sm bg-dark-100/90"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-dark-500 mt-2">Join us and start learning today</p>
        </motion.div>
        
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-2 text-dark-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input-field"
              placeholder="johndoe"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-2 text-dark-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="you@example.com"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-2 text-dark-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-2 text-dark-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </span>
            ) : (
              'Register'
            )}
          </motion.button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-sm text-dark-600"
        >
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 hover:text-primary-400 font-semibold transition-colors">
            Login
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
