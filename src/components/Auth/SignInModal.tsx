import React, { useState } from 'react';
import { XIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { Button } from '../UI/Button';
import { useAuth } from './AuthContext';

interface SignInModalProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ onClose, onSwitchToSignUp }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await login(formData.email, formData.password);

    if (success) {
      onClose();
    } else {
      setErrors({ general: 'Invalid email or password. Please try again.' });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-700">
        <div className="relative p-6">
          <button 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200" 
            onClick={onClose}
          >
            <XIcon size={20} />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
            <p className="text-gray-400 mt-1">Sign in to your WhiskerBond account</p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-rose-500'
                    }`}
                    placeholder="your@email.com"
                  />
                  <MailIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-2 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-rose-500'
                    }`}
                    placeholder="••••••••"
                  />
                  <LockIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-rose-500 focus:ring-rose-500 border-gray-600 rounded bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-rose-400 hover:text-rose-300"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mb-4" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-400">Don't have an account?</span>
            <button 
              className="font-medium text-rose-400 hover:text-rose-300 ml-1"
              onClick={onSwitchToSignUp}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
