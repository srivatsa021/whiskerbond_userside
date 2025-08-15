import React, { useState } from 'react';
import { XIcon, UserIcon, MailIcon, LockIcon, PhoneIcon, MapPinIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { Button } from '../UI/Button';
import { useAuth } from './AuthContext';

interface SignUpModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({ onClose, onSwitchToLogin }) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    alternatePhone: '',
    address: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (formData.alternatePhone && !/^\+?[\d\s\-()]+$/.test(formData.alternatePhone)) {
      newErrors.alternatePhone = 'Alternate phone number is invalid';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      alternatePhone: formData.alternatePhone || undefined,
      address: formData.address
    });

    if (success) {
      onClose();
    } else {
      setErrors({ general: 'Registration failed. Please try again.' });
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
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="relative p-6">
          <button 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200" 
            onClick={onClose}
          >
            <XIcon size={20} />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Join WhiskerBond</h2>
            <p className="text-gray-400 mt-1">Create your pet parent account</p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-rose-500'
                    }`}
                    placeholder="Your full name"
                  />
                  <UserIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address *
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
                  Password *
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

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-2 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-rose-500'
                    }`}
                    placeholder="••••••••"
                  />
                  <LockIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-rose-500'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  <PhoneIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Alternate Phone */}
              <div>
                <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-300 mb-1">
                  Alternate Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.alternatePhone ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-rose-500'
                    }`}
                    placeholder="+1 (555) 987-6543"
                  />
                  <PhoneIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.alternatePhone && <p className="text-red-400 text-xs mt-1">{errors.alternatePhone}</p>}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                  Address *
                </label>
                <div className="relative">
                  <textarea
                    id="address"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                      errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-rose-500'
                    }`}
                    placeholder="Your complete address"
                  />
                  <MapPinIcon size={18} className="absolute left-3 top-3 text-gray-400" />
                </div>
                {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full mb-4" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-400">Already have an account?</span>
            <button 
              className="font-medium text-rose-400 hover:text-rose-300 ml-1"
              onClick={onSwitchToLogin}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
