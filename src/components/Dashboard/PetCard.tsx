import React, { MouseEvent, useMemo, useState } from 'react';
import { EditIcon, FileTextIcon, TrashIcon } from 'lucide-react';
import PetAppointmentsPanel from './PetAppointmentsPanel';
import { Pet } from '../../types/pets';

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (petId: string) => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const getPetTypeEmoji = (type: string) => {
    const typeMap: Record<string, string> = {
      dog: '🐕',
      cat: '🐱',
      bird: '🐦',
      rabbit: '🐰',
      fish: '🐟',
      hamster: '🐹',
    };
    return typeMap[type.toLowerCase()] || '🐾';
  };

  const getAgeColor = (age: number) => {
    if (age < 1) return 'text-green-400';
    if (age < 5) return 'text-blue-400';
    if (age < 10) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const hasAppointments = !!(pet.appointments && pet.appointments.length > 0);

  const handleFrontClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-flip]')) return;
    setIsFlipped(true);
  };

  const petId = useMemo(() => pet.id || pet._id || '', [pet.id, pet._id]);

  return (
    <div className="bg-gray-700 rounded-lg border border-gray-600 hover:border-rose-500 transition-colors h-64 relative [perspective:1000px]">
      <div className={`absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        {/* Front */}
        <div className="absolute inset-0 p-4 [backface-visibility:hidden] cursor-pointer" onClick={handleFrontClick}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-2xl mr-2">{getPetTypeEmoji(pet.type)}</span>
              <div>
                <h3 className="font-semibold text-white">{pet.name}</h3>
                <p className="text-sm text-gray-400">{pet.breed}</p>
              </div>
            </div>
            <div className="flex space-x-1">
              <button data-no-flip onClick={() => onEdit(pet)} className="p-1 text-gray-400 hover:text-blue-400 transition-colors">
                <EditIcon size={16} />
              </button>
              <button
                data-no-flip
                onClick={() => petId && onDelete(petId)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Age:</span>
              <span className={`font-medium ${getAgeColor(pet.age)}`}>{pet.age} year{pet.age !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white">{pet.type}</span>
            </div>
            {pet.allergies && (
              <div className="flex justify-between">
                <span className="text-gray-400">Allergies:</span>
                <span className="text-red-400 text-xs truncate ml-2">{pet.allergies}</span>
              </div>
            )}
            {pet.behavior && (
              <div className="mt-2">
                <span className="text-gray-400 text-xs">Behavior: </span>
                <span className="text-gray-300 text-xs">{pet.behavior}</span>
              </div>
            )}
            {pet.medicalDocuments.length > 0 && (
              <div className="flex items-center mt-2 pt-2 border-t border-gray-600">
                <FileTextIcon size={14} className="text-blue-400 mr-1" />
                <span className="text-xs text-blue-400">{pet.medicalDocuments.length} medical document{pet.medicalDocuments.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            {hasAppointments && (
              <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">Tap card to view appointments</div>
            )}
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 p-2 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="bg-gray-700/60 rounded-md h-full border border-gray-600 relative overflow-hidden">
            <PetAppointmentsPanel appointments={pet.appointments || []} onClose={() => setIsFlipped(false)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetCard;
