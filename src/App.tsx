import React, { useEffect, useState } from 'react';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { Hero } from './components/Home/Hero';
import { ProductsSection } from './components/Sales/ProductsSection';
import { ServicesSection } from './components/Services/ServicesSection';
import { CommunitySection } from './components/Community/CommunitySection';
import { SignInModal } from './components/Auth/SignInModal';
import { SignUpModal } from './components/Auth/SignUpModal';
import { PetSelector } from './components/Pets/PetSelector';
import { PetContext } from './components/Pets/PetContext';
import { AuthProvider, useAuth } from './components/Auth/AuthContext';
import { PetDashboard } from './components/Dashboard/PetDashboard';
import { PawPrintIcon } from 'lucide-react';

// Inner App Component
function AppContent() {
  const { isLoggedIn, user, pets, isLoading, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [authModalType, setAuthModalType] = useState<'signin' | 'signup' | null>(null);
  const [activePet, setActivePet] = useState(null);
  const [showPawPrint, setShowPawPrint] = useState(false);
  const [pawPosition, setPawPosition] = useState({
    x: 0,
    y: 0
  });

  // Set first pet as active when pets are loaded
  useEffect(() => {
    if (pets.length > 0 && !activePet) {
      setActivePet(pets[0]);
    }
  }, [pets, activePet]);
  // Mouse click animation
  const handleMouseClick = e => {
    if (Math.random() > 0.3) {
      // Only show animation 70% of the time
      setPawPosition({
        x: e.clientX,
        y: e.clientY
      });
      setShowPawPrint(true);
      setTimeout(() => setShowPawPrint(false), 2000);
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleMouseClick);
    return () => {
      document.removeEventListener('click', handleMouseClick);
    };
  }, []);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading WhiskerBond...</p>
        </div>
      </div>
    );
  }

  return (
    <PetContext.Provider value={{
      activePet,
      setActivePet,
      pets
    }}>
      <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100" onClick={handleMouseClick}>
        {/* Paw print animation on click */}
        {showPawPrint && (
          <div
            className="fixed pointer-events-none z-50 animate-paw-print"
            style={{
              left: `${pawPosition.x - 15}px`,
              top: `${pawPosition.y - 15}px`
            }}
          >
            <PawPrintIcon size={30} className="text-rose-500 opacity-70" />
          </div>
        )}

        <Header
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onLoginClick={() => setAuthModalType('signin')}
          onSignUpClick={() => setAuthModalType('signup')}
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={logout}
        />

        {isLoggedIn && (
          <PetSelector
            pets={pets}
            activePet={activePet}
            setActivePet={setActivePet}
            onAddPet={() => setActiveSection('dashboard')}
          />
        )}

        <main className="flex-grow relative">
          {/* Background animations */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float opacity-5"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 1.5}s`
                }}
              >
                <PawPrintIcon size={Math.random() * 30 + 20} />
              </div>
            ))}
          </div>

          {activeSection === 'home' && (
            <>
              <Hero />
              {isLoggedIn ? (
                <>
                  <ProductsSection featured={true} />
                  <ServicesSection featured={true} />
                </>
              ) : (
                <>
                  <ProductsSection featured={true} />
                  <ServicesSection featured={true} />
                </>
              )}
            </>
          )}

          {activeSection === 'products' && <ProductsSection />}
          {activeSection === 'services' && <ServicesSection />}
          {activeSection === 'community' && (
            <CommunitySection
              onLoginRequired={() => setAuthModalType('signin')}
            />
          )}

          {activeSection === 'dashboard' && isLoggedIn && (
            <PetDashboard />
          )}
        </main>

        <Footer />

        {/* Authentication Modals */}
        {authModalType === 'signin' && (
          <SignInModal
            onClose={() => setAuthModalType(null)}
            onSwitchToSignUp={() => setAuthModalType('signup')}
          />
        )}

        {authModalType === 'signup' && (
          <SignUpModal
            onClose={() => setAuthModalType(null)}
            onSwitchToLogin={() => setAuthModalType('signin')}
          />
        )}
      </div>
    </PetContext.Provider>
  );
}

// Main App Component with Auth Provider
export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
