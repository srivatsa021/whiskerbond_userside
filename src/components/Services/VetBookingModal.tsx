import React, { useState, useContext } from 'react';
import { XIcon, CalendarIcon, ClockIcon, UserIcon, HeartIcon, DollarSignIcon } from 'lucide-react';
import { Button } from '../UI/Button';
import { useAuth } from '../Auth/AuthContext';
import { PetContext } from '../Pets/PetContext';

interface Provider {
  id?: string;
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  businessDescription: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price?: string | number;
  provider?: Provider;
  serviceDetails?: {
    duration?: string;
  };
}

interface VetBookingModalProps {
  service: Service;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export const VetBookingModal: React.FC<VetBookingModalProps> = ({
  service,
  onClose,
  onBookingSuccess
}) => {
  const { user } = useAuth();
  const { activePet } = useContext(PetContext);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate available dates (next 30 days, excluding Sundays)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays (0 = Sunday)
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    
    return dates;
  };

  // Generate time slots (9 AM to 6 PM, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break; // Stop at 6:00 PM
        
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        
        slots.push({
          value: time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          label: time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        });
      }
    }
    return slots;
  };

  const availableDates = generateAvailableDates();
  const timeSlots = generateTimeSlots();

  const handleBooking = async () => {
    if (!activePet) {
      setError('Please select a pet before booking.');
      return;
    }

    if (!user) {
      setError('Please log in to book a service.');
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check for existing booking first
      const checkResponse = await fetch(`/api/vet-bookings/check?petId=${activePet.id}&serviceName=${encodeURIComponent(service.name)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.hasBooking) {
          setError('You already have an active appointment for this service. Please wait for it to be completed or cancelled before booking again.');
          setIsLoading(false);
          return;
        }
      }

      const bookingData = {
        petId: activePet.id,
        petName: activePet.name,
        petParent: user.name,
        serviceName: service.name,
        serviceCategory: service.category,
        provider: service.provider?.businessName || 'Unknown Provider',
        providerId: service.provider?.id || null, // Include provider ID if available
        serviceId: service.id,
        price: typeof service.price === 'number' ? service.price : parseFloat(service.price?.toString().replace(/[^0-9.]/g, '') || '0'),
        duration: service.serviceDetails?.duration || 'Not specified',
        date: selectedDate,
        time: selectedTime,
        notes: notes.trim(),
        symptoms: symptoms.trim(),
        isEmergency,
        status: 'confirmed'
      };

      const response = await fetch('/api/vet-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const result = await response.json();
      console.log('Booking created:', result);

      onBookingSuccess();
      onClose();
    } catch (err) {
      console.error('Booking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Book Vet Service</h2>
            <button 
              className="text-gray-400 hover:text-gray-300" 
              onClick={onClose}
            >
              <XIcon size={24} />
            </button>
          </div>

          {/* Service Info */}
          <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 mb-6 border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-2">{service.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Category:</span>
                <span className="text-white ml-2">{service.category}</span>
              </div>
              <div>
                <span className="text-gray-400">Price:</span>
                <span className="text-rose-400 ml-2 font-semibold">
                  {typeof service.price === 'number' ? `$${service.price}` : service.price || 'Contact for price'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Duration:</span>
                <span className="text-white ml-2">{service.serviceDetails?.duration || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-400">Provider:</span>
                <span className="text-white ml-2">{service.provider?.businessName || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Pet and User Info */}
          <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 mb-6 border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <HeartIcon size={18} className="mr-2 text-rose-400" />
              Booking Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Pet:</span>
                <span className="text-white ml-2">
                  {activePet ? `${activePet.name} (${activePet.type})` : 'No pet selected'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Pet Parent:</span>
                <span className="text-white ml-2">{user?.name || 'Not logged in'}</span>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3 flex items-center">
              <CalendarIcon size={16} className="mr-2 text-blue-400" />
              Select Date
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {availableDates.map(date => (
                <button
                  key={date.value}
                  className={`p-2 text-xs rounded-lg border transition-colors ${
                    selectedDate === date.value
                      ? 'bg-rose-600 border-rose-600 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedDate(date.value)}
                >
                  {date.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3 flex items-center">
              <ClockIcon size={16} className="mr-2 text-green-400" />
              Select Time
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {timeSlots.map(slot => (
                <button
                  key={slot.value}
                  className={`p-2 text-xs rounded-lg border transition-colors ${
                    selectedTime === slot.value
                      ? 'bg-rose-600 border-rose-600 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedTime(slot.value)}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-6 space-y-4">
            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or information..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Symptoms or Concerns (Optional)
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe any symptoms or health concerns..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Emergency Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isEmergency"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="w-4 h-4 text-rose-600 bg-gray-700 border-gray-600 rounded focus:ring-rose-500 focus:ring-2"
              />
              <label htmlFor="isEmergency" className="text-sm text-white cursor-pointer">
                This is an emergency appointment
              </label>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-600 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-rose-600 hover:bg-rose-700"
              onClick={handleBooking}
              disabled={isLoading || !selectedDate || !selectedTime || !activePet || !user}
            >
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>

          {/* Booking Summary */}
          {selectedDate && selectedTime && (
            <div className="mt-4 p-3 bg-green-900 bg-opacity-30 border border-green-600 rounded-lg">
              <h4 className="text-sm font-semibold text-green-300 mb-2">Booking Summary</h4>
              <div className="text-xs text-green-200 space-y-1">
                <div><span className="font-medium">Service:</span> {service.name}</div>
                <div><span className="font-medium">Date:</span> {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div><span className="font-medium">Time:</span> {selectedTime}</div>
                <div><span className="font-medium">Pet:</span> {activePet?.name}</div>
                <div><span className="font-medium">Duration:</span> {service.serviceDetails?.duration || 'Not specified'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
