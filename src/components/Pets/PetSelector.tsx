import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react';
interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  avatar: string;
  color?: string;
}
interface PetSelectorProps {
  pets: Pet[];
  activePet: Pet | null;
  setActivePet: (pet: Pet) => void;
  onAddPet?: () => void;
}
export const PetSelector = ({
  pets,
  activePet,
  setActivePet,
  onAddPet
}: PetSelectorProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
  };
  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollButtons);
      }
    };
  }, [pets]);
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };
  return <div className="sticky top-16 z-40 bg-gray-800 shadow-md border-b border-gray-700">
      <div className="container mx-auto px-4 py-2 relative">
        <div className="flex items-center">
          <h3 className="text-white font-semibold mr-4 whitespace-nowrap">
            My Pets:
          </h3>
          <div className="relative flex-grow overflow-hidden">
            {showLeftArrow && <button onClick={scrollLeft} className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-900 bg-opacity-70 p-1 rounded-full z-10">
                <ChevronLeftIcon size={20} className="text-gray-300" />
              </button>}
            <div ref={scrollContainerRef} className="flex space-x-3 overflow-x-auto scrollbar-hide py-2 px-1">
              {pets.length === 0 ? (
                <div className="flex items-center space-x-2 py-1 px-3 text-gray-400 text-sm">
                  <span>No pets yet.</span>
                </div>
              ) : (
                pets.map(pet => <button key={pet.id} className={`flex items-center space-x-2 py-1 px-3 rounded-full flex-shrink-0 transition-all ${activePet?.id === pet.id ? `bg-${pet.color || 'rose'}-500 text-white` : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} onClick={() => setActivePet(pet)}>
                    <img src={pet.avatar} alt={pet.name} className={`w-8 h-8 rounded-full object-cover border-2 ${activePet?.id === pet.id ? 'border-white' : 'border-gray-600'}`} />
                    <span className="font-medium">{pet.name}</span>
                    <span className="text-xs opacity-70">{pet.breed}</span>
                  </button>)
              )}
              <button key="add-pet" onClick={onAddPet} className="flex items-center space-x-2 py-1 px-3 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <PlusIcon size={18} className="text-gray-300" />
                </div>
                <span className="font-medium">Add Pet</span>
              </button>
            </div>
            {showRightArrow && <button onClick={scrollRight} className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-900 bg-opacity-70 p-1 rounded-full z-10">
                <ChevronRightIcon size={20} className="text-gray-300" />
              </button>}
          </div>
        </div>
      </div>
    </div>;
};
