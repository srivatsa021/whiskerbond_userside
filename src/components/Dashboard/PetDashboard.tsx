import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, EditIcon, TrashIcon, UploadIcon, FileTextIcon, PawPrintIcon, CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '../UI/Button';
import { useAuth } from '../Auth/AuthContext';

interface Appointment {
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
}

interface Pet {
  id?: string;
  _id?: string;
  name: string;
  age: number;
  type: string;
  breed: string;
  behavior?: string;
  allergies: string;
  medicalDocuments: string[];
  appointments?: Appointment[];
  petOwnerId: string;
  createdAt: string;
  images?: string[];
  avatar?: string;
  aspectRatio?: string;
  fitMode?: 'cover' | 'contain';
}

export const PetDashboard: React.FC = () => {
  const { user, pets, addPet, updatePet, deletePet, isLoading, syncAppointments } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-sync appointments on component mount
  useEffect(() => {
    if (user && pets.length > 0) {
      handleSyncAppointments();
    }
  }, [user, pets.length]);

  const handleSyncAppointments = async () => {
    setIsSyncing(true);
    try {
      await syncAppointments();
    } catch (error) {
      console.error('Failed to sync appointments:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name}! 🐾
        </h1>
        <p className="text-gray-400">
          Manage your pets and keep track of their health and information
        </p>
      </div>

      {/* My Pets Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <PawPrintIcon className="mr-2 text-rose-500" size={24} />
            My Pets ({pets.length})
          </h2>
          <div className="flex space-x-2">
            <Button
              onClick={handleSyncAppointments}
              disabled={isSyncing}
              variant="outline"
              className="flex items-center"
            >
              <RefreshCwIcon size={18} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Appointments'}
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              className="flex items-center"
            >
              <PlusIcon size={18} className="mr-2" />
              Add New Pet
            </Button>
          </div>
        </div>

        {pets.length === 0 ? (
          <div className="text-center py-12">
            <PawPrintIcon size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No pets yet</h3>
            <p className="text-gray-500 mb-4">
              Add your first pet to start managing their information and health records
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <PlusIcon size={18} className="mr-2" />
              Add Your First Pet
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <PetCard
                key={pet.id || pet._id}
                pet={pet}
                onEdit={setEditingPet}
                onDelete={() => deletePet(pet.id || pet._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Pet Modal */}
      {(showAddForm || editingPet) && (
        <PetFormModal
          pet={editingPet}
          onClose={() => {
            setShowAddForm(false);
            setEditingPet(null);
          }}
          onSave={async (petData) => {
            if (editingPet) {
              await updatePet(editingPet.id, petData);
            } else {
              await addPet(petData);
            }
            setShowAddForm(false);
            setEditingPet(null);
          }}
        />
      )}
    </div>
  );
};

// Pet Card Component
interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (petId: string) => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete }) => {
  const [showAppointments, setShowAppointments] = useState(false);

  const getPetTypeEmoji = (type: string) => {
    const typeMap: Record<string, string> = {
      'dog': '🐕',
      'cat': '🐱',
      'bird': '🐦',
      'rabbit': '🐰',
      'fish': '🐟',
      'hamster': '🐹',
    };
    return typeMap[type.toLowerCase()] || '🐾';
  };

  const getAgeColor = (age: number) => {
    if (age < 1) return 'text-green-400';
    if (age < 5) return 'text-blue-400';
    if (age < 10) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const displayImage = (pet as any).avatar || ((pet as any).images && (pet as any).images.length > 0 ? (pet as any).images[0] : null) || 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1450&q=80';

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-rose-500 transition-colors">
      {/* Pet Image / DP */}
      <div className="mb-3">
        <div className="w-full h-40 rounded-md overflow-hidden mb-3 bg-gray-600">
          <img src={displayImage} alt={pet.name} className={`w-full h-full ${(pet as any).fitMode === 'contain' ? 'object-contain' : 'object-cover'}`} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{getPetTypeEmoji(pet.type)}</span>
          <div>
            <h3 className="font-semibold text-white">{pet.name}</h3>
            <p className="text-sm text-gray-400">{pet.breed}</p>
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(pet)}
            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <EditIcon size={16} />
          </button>
          <button
            onClick={() => onDelete(pet.id)}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Age:</span>
          <span className={`font-medium ${getAgeColor(pet.age)}`}>
            {pet.age} year{pet.age !== 1 ? 's' : ''}
          </span>
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
            <span className="text-xs text-blue-400">
              {pet.medicalDocuments.length} medical document{pet.medicalDocuments.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Appointments Section */}
        {pet.appointments && pet.appointments.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <button
              onClick={() => setShowAppointments(!showAppointments)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center">
                <CalendarIcon size={14} className="text-green-400 mr-1" />
                <span className="text-xs text-green-400">
                  {pet.appointments.length} appointment{pet.appointments.length !== 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {showAppointments ? '▼' : '▶'}
              </span>
            </button>

            {showAppointments && (
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {pet.appointments
                  .sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime())
                  .map((appointment) => (
                    <AppointmentCard key={appointment.appointmentId} appointment={appointment} />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Appointment Card Component
interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-400';
      case 'confirmed': return 'text-blue-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircleIcon size={12} />;
      case 'cancelled': return <XCircleIcon size={12} />;
      default: return <ClockIcon size={12} />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-gray-800 rounded-md p-2 border border-gray-600">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className={`flex items-center ${getStatusColor(appointment.status)}`}>
              {getStatusIcon(appointment.status)}
              <span className="ml-1 text-xs font-medium capitalize">{appointment.status}</span>
            </span>
            {appointment.isEmergency && (
              <span className="text-xs bg-red-600 text-white px-1 rounded">Emergency</span>
            )}
          </div>
          <p className="text-xs text-white truncate mt-1">{appointment.serviceName}</p>
          <p className="text-xs text-gray-400">
            {formatDate(appointment.appointmentTime)} at {formatTime(appointment.appointmentTime)}
          </p>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-gray-400 hover:text-white ml-2"
        >
          {showDetails ? '▼' : '▶'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400">Vet:</span>
              <p className="text-white truncate">{appointment.vetName}</p>
            </div>
            <div>
              <span className="text-gray-400">Duration:</span>
              <p className="text-white">{appointment.duration}</p>
            </div>
            <div>
              <span className="text-gray-400">Price:</span>
              <p className="text-green-400">${appointment.price}</p>
            </div>
            <div>
              <span className="text-gray-400">Follow-up:</span>
              <p className="text-white">{appointment.followUpRequired ? 'Required' : 'Not needed'}</p>
            </div>
          </div>

          {appointment.notes && (
            <div>
              <span className="text-gray-400 text-xs">Notes:</span>
              <p className="text-white text-xs mt-1">{appointment.notes}</p>
            </div>
          )}

          {appointment.symptoms && (
            <div>
              <span className="text-gray-400 text-xs">Symptoms:</span>
              <p className="text-white text-xs mt-1">{appointment.symptoms}</p>
            </div>
          )}

          {appointment.diagnosis && (
            <div>
              <span className="text-gray-400 text-xs">Diagnosis:</span>
              <p className="text-white text-xs mt-1">{appointment.diagnosis}</p>
            </div>
          )}

          {appointment.treatment && (
            <div>
              <span className="text-gray-400 text-xs">Treatment:</span>
              <p className="text-white text-xs mt-1">{appointment.treatment}</p>
            </div>
          )}

          {appointment.prescription && (
            <div>
              <span className="text-gray-400 text-xs">Prescription:</span>
              <p className="text-white text-xs mt-1">{appointment.prescription.instructions}</p>
            </div>
          )}

          {appointment.documents && appointment.documents.length > 0 && (
            <div>
              <span className="text-gray-400 text-xs">Documents:</span>
              <div className="mt-1 space-y-1">
                {appointment.documents.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between">
                    <span className="text-xs text-blue-400 capitalize">{doc.type}</span>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Pet Form Modal Component
interface PetFormModalProps {
  pet?: Pet | null;
  onClose: () => void;
  onSave: (petData: any) => void;
}

const PetFormModal: React.FC<PetFormModalProps> = ({ pet, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: pet?.name || '',
    age: pet?.age || 1,
    type: pet?.type || 'Dog',
    breed: pet?.breed || '',
    behavior: pet?.behavior || '',
    allergies: pet?.allergies || ''
  });

  const [images, setImages] = useState<string[]>(() => (pet && (pet as any).images ? (pet as any).images.slice(0, 5) : []));
  const [error, setError] = useState<string | null>(null);

  const [editorState, setEditorState] = useState<{open:false} | {open:true,index:number,src:string}>({open:false});

  const petTypes = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'Guinea Pig', 'Other'];

  // Simple image editor: pan + zoom + crop to dataURL (square DP crop)
  const ImageEditor = React.useMemo(() => {
    const Comp: React.FC<{
      src: string;
      onCancel: () => void;
      onSave: (dataUrl: string) => void;
    }> = ({ src, onCancel, onSave }) => {
      const canvasRef = useRef<HTMLCanvasElement | null>(null);
      const imgRef = useRef<HTMLImageElement | null>(null);
      const [isDragging, setIsDragging] = useState(false);
      const [pos, setPos] = useState({ x: 0, y: 0 });
      const [start, setStart] = useState({ x: 0, y: 0 });
      const [scale, setScale] = useState(1);

      // Fixed square canvas for DP crop
      const getCanvasSize = () => ({ width: 800, height: 800 });

      const draw = () => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const { width, height } = getCanvasSize();
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = '#222';
        ctx.fillRect(0,0,width,height);
        const iw = img.width;
        const ih = img.height;

        const scaledW = iw * scale;
        const scaledH = ih * scale;
        const dx = pos.x + (width - scaledW)/2;
        const dy = pos.y + (height - scaledH)/2;
        ctx.drawImage(img, dx, dy, scaledW, scaledH);
      };

      const clampAndSetPos = (nx: number, ny: number, nextScale = scale) => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) {
          setPos({ x: nx, y: ny });
          return;
        }
        const { width, height } = getCanvasSize();
        const iw = img.width;
        const ih = img.height;
        const scaledW = iw * nextScale;
        const scaledH = ih * nextScale;

        const ax = (width - scaledW) / 2;
        const ay = (height - scaledH) / 2;

        let minDX: number, maxDX: number, minDY: number, maxDY: number;

        if (scaledW >= width) {
          minDX = width - scaledW;
          maxDX = 0;
        } else {
          minDX = ax;
          maxDX = ax;
        }

        if (scaledH >= height) {
          minDY = height - scaledH;
          maxDY = 0;
        } else {
          minDY = ay;
          maxDY = ay;
        }

        let dx = nx + ax;
        let dy = ny + ay;

        if (dx < minDX) dx = minDX;
        if (dx > maxDX) dx = maxDX;
        if (dy < minDY) dy = minDY;
        if (dy > maxDY) dy = maxDY;

        const px = dx - ax;
        const py = dy - ay;

        setPos({ x: px, y: py });
      };

      useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          imgRef.current = img;
          setPos({ x: 0, y: 0 });
          setScale(1);
          draw();
        };
        img.src = src;
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [src]);

      useEffect(() => { draw(); }, [pos, scale]);

      const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setStart({ x: e.clientX, y: e.clientY });
      };
      const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        setStart({ x: e.clientX, y: e.clientY });
        clampAndSetPos(pos.x + dx, pos.y + dy);
      };
      const onMouseUp = () => setIsDragging(false);

      const onWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = -e.deltaY;
        const factor = delta > 0 ? 1.05 : 0.95;
        const next = Math.min(3, Math.max(0.5, scale * factor));
        clampAndSetPos(pos.x, pos.y, next);
        setScale(next);
      };

      const save = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onSave(dataUrl);
      };

      return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-4 max-w-3xl w-full">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center justify-center">
                <div onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onWheel={onWheel} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
                  <div style={{ width: '600px', height: '600px', position: 'relative' }}>
                    <canvas ref={canvasRef} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
                    <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                      <svg width="100%" height="100%">
                        <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#ffffff22" strokeWidth="2" />
                        <line x1="33%" y1="0" x2="33%" y2="100%" stroke="#ffffff22" />
                        <line x1="66%" y1="0" x2="66%" y2="100%" stroke="#ffffff22" />
                        <line x1="0" y1="33%" x2="100%" y2="33%" stroke="#ffffff22" />
                        <line x1="0" y1="66%" x2="100%" y2="66%" stroke="#ffffff22" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-48 min-w-0">
                <div className="mb-3 overflow-hidden">
                  <label className="block text-sm text-gray-300 mb-1">Zoom</label>
                  <input type="range" min="0.5" max="3" step="0.01" value={scale} onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    clampAndSetPos(pos.x, pos.y, val);
                    setScale(val);
                  }} className="block w-full max-w-full" />
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button onClick={save} className="flex-1">Apply</Button>
                  <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };
    return Comp;
  }, []);

  const handleFiles = (files: FileList | null) => {
    setError(null);
    if (!files) return;
    const fileArray = Array.from(files);
    const total = images.length + fileArray.length;
    if (total > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const readers = fileArray.map(file => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    }));

    Promise.all(readers)
      .then(results => {
        const valid = results.filter(r => typeof r === 'string');
        setImages(prev => [...prev, ...valid]);
      })
      .catch(err => {
        console.error('Error reading images:', err);
        setError('Failed to read one or more images');
      });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Enforce image count limits when adding a new pet
    if (!pet && images.length === 0) {
      setError('Please upload at least 1 image');
      return;
    }
    if (images.length < 1 || images.length > 5) {
      setError('Please provide between 1 and 5 images');
      return;
    }

    const payload: any = {
      ...formData,
      images
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full border border-gray-700">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">{pet ? 'Edit Pet' : 'Add New Pet'}</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Pet Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Age *</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={formData.age}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setFormData({...formData, age: isNaN(value) ? 1 : value});
                      }}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    >
                      {petTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Breed *</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({...formData, breed: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Allergies *</label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                    placeholder="None, or list specific allergies"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Behavior (Optional)</label>
              <textarea
                rows={3}
                value={formData.behavior}
                onChange={(e) => setFormData({...formData, behavior: e.target.value})}
                placeholder="Describe your pet's behavior..."
                className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Image Crop / Position</label>
                <p className="text-sm text-gray-400">Upload images and use the editor (✎) to pan & zoom and set the square DP crop. The editor enforces the display ratio used across the site.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Pet Photos - 1 to 5 images *</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  className="w-full text-sm text-gray-300"
                />
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

                {images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative rounded-md overflow-hidden bg-gray-600">
                          <div style={{position: 'relative', width: '100%', paddingTop: '100%'}}>
                            <img src={img} alt={`preview-${idx}`} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
                            <div className="absolute top-1 right-1 flex space-x-1">
                              <button type="button" onClick={() => setEditorState({open:true,index:idx,src:img})} className="bg-black bg-opacity-50 p-1 rounded-full text-white">✎</button>
                              <button type="button" onClick={() => removeImage(idx)} className="bg-black bg-opacity-50 p-1 rounded-full text-white">×</button>
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1">{pet ? 'Update Pet' : 'Add Pet'}</Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            </div>
            {editorState.open && (
              <ImageEditor
                src={editorState.open ? editorState.src : ''}
                onCancel={() => setEditorState({open:false})}
                onSave={(dataUrl) => {
                  setImages(prev => prev.map((it, i) => i === editorState.index ? dataUrl : it));
                  setEditorState({open:false});
                }}
              />
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
