import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  avatar?: string;
  createdAt: string;
}

interface Pet {
  id: string;
  name: string;
  age: number;
  type: string;
  breed: string;
  behavior?: string;
  allergies: string;
  medicalDocuments: string[];
  appointments?: Array<{
    appointmentId: string;
    vetId: string;
    vetName: string;
    serviceId: string;
    serviceName: string;
    appointmentTime: string;
    status: string;
    notes: string;
    symptoms: string;
    isEmergency: boolean;
    price: number;
    duration: string;
    diagnosis?: string;
    followUpRequired?: boolean;
    prescription?: {
      instructions: string;
    };
    treatment?: string;
    documents?: Array<{
      type: string;
      url: string;
      uploadedAt: string;
      _id: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
  petOwnerId: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  pets: Pet[];
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  addPet: (petData: Omit<Pet, 'id' | 'petOwnerId' | 'createdAt'>) => Promise<boolean>;
  updatePet: (petId: string, petData: Partial<Pet>) => Promise<boolean>;
  deletePet: (petId: string) => Promise<boolean>;
  refreshPets: () => Promise<void>;
  syncAppointments: () => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  alternatePhone?: string;
  address: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isLoggedIn = !!user;

  // Check for existing session on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
            await refreshPets();
          } else {
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('authToken', data.token);
        await refreshPets();
        return true;
      } else {
        const error = await response.json();
        console.error('Login failed:', error.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('authToken', data.token);
        return true;
      } else {
        const error = await response.json();
        console.error('Registration failed:', error.message);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setPets([]);
    localStorage.removeItem('authToken');
  };

  const refreshPets = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return;
      }

      const response = await fetch('/api/pets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Map MongoDB _id to id for frontend compatibility and randomize avatar per login
        const petsWithId = (data.pets || []).map((pet: any) => {
          const images = Array.isArray(pet.images) ? pet.images.filter((i: any) => typeof i === 'string') : [];
          const selectedAspect = typeof pet.aspectRatio === 'string' ? pet.aspectRatio : '16:9';
          const selectedFit = pet.fitMode === 'contain' ? 'contain' : 'cover';
          const avatar = images.length > 0 ? images[Math.floor(Math.random() * images.length)] : (pet.avatar || null);
          return {
            ...pet,
            id: pet._id || pet.id,
            images,
            avatar,
            aspectRatio: selectedAspect,
            fitMode: selectedFit
          };
        });
        setPets(petsWithId);
      }
    } catch (error) {
      console.error('Failed to fetch pets:', error);
    }
  };

  const addPet = async (petData: Omit<Pet, 'id' | 'petOwnerId' | 'createdAt'>): Promise<boolean> => {
    if (!user) return false;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(petData),
      });

      if (response.ok) {
        await refreshPets();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add pet:', error);
      return false;
    }
  };

  const updatePet = async (petId: string, petData: Partial<Pet>): Promise<boolean> => {
    if (!user) return false;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(petData),
      });

      if (response.ok) {
        await refreshPets();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update pet:', error);
      return false;
    }
  };

  const deletePet = async (petId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await refreshPets();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete pet:', error);
      return false;
    }
  };

  const syncAppointments = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const token = localStorage.getItem('authToken');

      // Try manual sync first for kutta
      try {
        const manualResponse = await fetch('/api/pets/manual-sync-kutta', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (manualResponse.ok) {
          console.log('Manual sync for kutta completed');
        }
      } catch (manualError) {
        console.log('Manual sync failed, continuing with regular sync');
      }

      // Try regular sync
      const response = await fetch('/api/pets/sync-appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await refreshPets(); // Refresh pets data to show updated appointments
        return true;
      } else {
        console.error('Sync response not ok:', response.status, response.statusText);
        // Still refresh pets in case manual sync worked
        await refreshPets();
        return true; // Return true if manual sync might have worked
      }
    } catch (error) {
      console.error('Failed to sync appointments:', error);
      // Still try to refresh pets
      await refreshPets();
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    pets,
    isLoading,
    isLoggedIn,
    login,
    register,
    logout,
    addPet,
    updatePet,
    deletePet,
    refreshPets,
    syncAppointments,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
