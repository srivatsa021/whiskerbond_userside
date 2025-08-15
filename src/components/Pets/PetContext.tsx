import React, { createContext } from 'react';
interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  avatar: string;
  color?: string;
}
interface PetContextType {
  activePet: Pet | null;
  setActivePet: (pet: Pet) => void;
  pets: Pet[];
}
export const PetContext = createContext<PetContextType>({
  activePet: null,
  setActivePet: () => {},
  pets: []
});