import React, { useState } from 'react';
import { SearchIcon, ShoppingCartIcon, UserIcon, MenuIcon, XIcon, PawPrintIcon, LogOutIcon } from 'lucide-react';
import { Button } from '../UI/Button';
interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  isLoggedIn: boolean;
  user?: any;
  onLogout: () => void;
}
export const Header = ({
  activeSection,
  setActiveSection,
  onLoginClick,
  onSignUpClick,
  isLoggedIn,
  user,
  onLogout
}: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = isLoggedIn ? [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'products', label: 'Products' },
    { id: 'services', label: 'Services' },
    { id: 'community', label: 'Community' }
  ] : [
    { id: 'home', label: 'Home' },
    { id: 'products', label: 'Products' },
    { id: 'services', label: 'Services' },
    { id: 'community', label: 'Community' }
  ];
  return <header className="sticky top-0 z-50 bg-gray-800 shadow-md border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2" onClick={() => setActiveSection('home')} role="button">
            <div className="relative">
              <PawPrintIcon className="h-8 w-8 text-rose-500" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-pulse"></span>
            </div>
            <span className="text-2xl font-bold text-rose-500">
              Whisker<span className="text-amber-400">Bond</span>
            </span>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map(item => <button key={item.id} className={`font-medium hover:text-rose-400 transition-colors ${activeSection === item.id ? 'text-rose-500 border-b-2 border-rose-500' : 'text-gray-300'}`} onClick={() => setActiveSection(item.id)}>
                {item.label}
              </button>)}
          </nav>
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-300 hover:text-rose-400 transition-colors">
              <SearchIcon size={20} />
            </button>
            <button className="p-2 text-gray-300 hover:text-rose-400 transition-colors">
              <ShoppingCartIcon size={20} />
            </button>
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <img
                    src={user?.avatar || "https://randomuser.me/api/portraits/women/44.jpg"}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-rose-500"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-800"></span>
                </div>
                <span className="text-gray-300 text-sm font-medium hidden lg:inline">
                  {user?.name || 'User'}
                </span>
                <button
                  className="p-1 text-gray-300 hover:text-rose-400 transition-colors"
                  onClick={onLogout}
                  title="Logout"
                >
                  <LogOutIcon size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button onClick={onLoginClick} variant="outline" className="text-sm">
                  <UserIcon size={16} className="mr-1" />
                  Sign In
                </Button>
                <Button onClick={onSignUpClick} className="text-sm">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map(item => <button key={item.id} className={`font-medium p-2 hover:bg-gray-700 rounded transition-colors ${activeSection === item.id ? 'text-rose-500 bg-gray-700' : 'text-gray-300'}`} onClick={() => {
            setActiveSection(item.id);
            setMobileMenuOpen(false);
          }}>
                  {item.label}
                </button>)}
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <button className="p-2 text-gray-300">
                  <SearchIcon size={20} />
                </button>
                <button className="p-2 text-gray-300">
                  <ShoppingCartIcon size={20} />
                </button>
                {isLoggedIn ? (
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <img
                        src={user?.avatar || "https://randomuser.me/api/portraits/women/44.jpg"}
                        alt="User avatar"
                        className="w-8 h-8 rounded-full object-cover border-2 border-rose-500"
                      />
                      <span className="text-gray-300 text-sm font-medium">
                        {user?.name || 'User'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="p-2 text-gray-300 hover:text-rose-400"
                    >
                      <LogOutIcon size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Button
                      onClick={() => {
                        onLoginClick();
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <UserIcon size={16} className="mr-2" />
                      Sign In
                    </Button>
                    <Button
                      onClick={() => {
                        onSignUpClick();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>}
      </div>
    </header>;
};
