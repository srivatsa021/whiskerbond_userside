import React, { useState } from 'react';
import { XIcon, UserIcon, LockIcon, AppleIcon } from 'lucide-react';
import { Button } from '../UI/Button';
import { GoogleIcon } from '../UI/Icons';
interface LoginModalProps {
  onClose: () => void;
  onLogin?: () => void;
}
export const LoginModal = ({
  onClose,
  onLogin
}: LoginModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const handleSubmit = e => {
    e.preventDefault();
    if (onLogin) onLogin();
    onClose();
  };
  return <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-700">
        <div className="relative p-6">
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-200" onClick={onClose}>
            <XIcon size={20} />
          </button>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isLogin ? 'Welcome Back!' : 'Join WhiskerBond'}
            </h2>
            <p className="text-gray-400 mt-1">
              {isLogin ? 'Log in to connect with the pet community' : 'Create an account to get started'}
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input type="email" id="email" className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="your@email.com" />
                  <UserIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input type="password" id="password" className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="••••••••" />
                  <LockIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              {!isLogin && <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input type="password" id="confirm-password" className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="••••••••" />
                    <LockIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>}
            </div>
            {isLogin && <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox" className="h-4 w-4 text-rose-500 focus:ring-rose-500 border-gray-600 rounded bg-gray-700" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-rose-400 hover:text-rose-300">
                    Forgot password?
                  </a>
                </div>
              </div>}
            <Button type="submit" className="w-full mb-4">
              {isLogin ? 'Log In' : 'Sign Up'}
            </Button>
          </form>
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex items-center justify-center py-2 px-4 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-gray-200 hover:bg-gray-600">
              <GoogleIcon className="mr-2" />
              Google
            </button>
            <button className="flex items-center justify-center py-2 px-4 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-gray-200 hover:bg-gray-600">
              <AppleIcon className="mr-2" size={18} />
              Apple
            </button>
          </div>
          <div className="text-center text-sm">
            <span className="text-gray-400">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <button className="font-medium text-rose-400 hover:text-rose-300 ml-1" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>;
};