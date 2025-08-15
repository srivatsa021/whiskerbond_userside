import React, { useContext } from 'react';
import { Button } from '../UI/Button';
import { PawPrintIcon } from 'lucide-react';
import { PetContext } from '../Pets/PetContext';
export const Hero = () => {
  const {
    activePet
  } = useContext(PetContext);
  return <section className="relative bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-6 md:mb-0 md:pr-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {activePet ? `${activePet.name}'s` : 'Where Pet Lovers'}
              <span className="text-rose-500"> Bond</span>
            </h1>
            <p className="text-base md:text-lg text-gray-300 mb-6">
              {activePet ? `Explore premium products, services, and connect with other ${activePet.type.toLowerCase()} lovers in our vibrant community.` : "Join our community of passionate pet owners. Find premium products, trusted services, and share your furry friend's journey with fellow animal lovers."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="md">Explore Products</Button>
              <Button variant="outline" size="md">
                Join Community
              </Button>
            </div>
            <div className="mt-6 flex items-center text-gray-400 text-sm">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center" style={{
                animationDelay: `${i * 0.2}s`
              }}>
                    <PawPrintIcon size={14} className="text-rose-400" />
                  </div>)}
              </div>
              <span className="ml-3">Join 10,000+ pet lovers</span>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="rounded-xl overflow-hidden shadow-xl border border-gray-700 animate-float">
              <img src={activePet?.avatar || 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1450&q=80'} alt={activePet ? `${activePet.name} the ${activePet.breed}` : 'Happy dog and cat together'} className="w-full h-auto object-cover" />
            </div>
            <div className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 bg-gray-800 p-2 md:p-3 rounded-lg shadow-lg border border-gray-700 hidden sm:block">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-medium text-white text-xs md:text-sm">
                  2,500+ Active Members
                </span>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-gray-800 p-2 md:p-3 rounded-lg shadow-lg border border-gray-700 hidden sm:block">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="font-medium text-white text-xs md:text-sm">
                  500+ Products
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-10 left-5 w-10 h-10 md:w-20 md:h-20 text-gray-800 opacity-20 hidden lg:block animate-float">
        <PawPrintIcon size={40} />
      </div>
      <div className="absolute bottom-5 right-5 w-8 h-8 md:w-16 md:h-16 text-gray-800 opacity-20 hidden lg:block animate-float" style={{
      animationDelay: '2s'
    }}>
        <PawPrintIcon size={32} />
      </div>
    </section>;
};