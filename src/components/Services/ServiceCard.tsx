import React, { useState, useEffect, useContext } from 'react';
import { MapPinIcon, StarIcon, ExternalLinkIcon, PhoneIcon, MailIcon, CheckCircleIcon } from 'lucide-react';
import { Button } from '../UI/Button';
import { ServiceDetailsModal } from './ServiceDetailsModal';
import { VetBookingModal } from './VetBookingModal';
import { useAuth } from '../Auth/AuthContext';
import { PetContext } from '../Pets/PetContext';

interface Provider {
  id?: string;
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  businessDescription: string;
  website?: string;
  establishedYear?: number;
  rating?: number;
  totalReviews?: number;
}

interface ServiceDetails {
  duration?: string;
  availability?: string;
  requirements?: string;
  includes?: string;
  excludes?: string;
  appointmentRequired?: boolean;
  isEmergency?: boolean;
  emergency24Hrs?: boolean;

  // Trainer specific
  specialization?: string;
  trainingMethods?: string[];
  experienceYears?: string | number;
  certifications?: string[];
  groupSessions?: boolean;
  privateSessions?: boolean;
  homeVisits?: boolean;
  trainingPrograms?: string[];
  ageGroups?: string[];

  // Walker specific
  walkingAreas?: string[];
  walkDuration?: string;
  groupWalks?: boolean;
  soloWalks?: boolean;
  pickupDropoff?: boolean;
  weekendAvailability?: boolean;
  emergencyWalks?: boolean;
  maxPetsPerWalk?: number;
  weatherPolicy?: string;

  // NGO specific
  adoptionServices?: boolean;
  availableForAdoption?: any[];
  adoptionProcess?: string[];
  adoptionFee?: string;
  volunteerOpportunities?: string[];
  donationInfo?: string;
  rescueTypes?: string[];
  spayNeuterRequired?: boolean;
  followUpSupport?: boolean;

  // Vet specific
  emergencyServices?: boolean;
  surgicalServices?: boolean;
  diagnosticServices?: boolean;
  vaccinationServices?: boolean;
  dentalServices?: boolean;
  specialties?: string[];
  labServices?: boolean;
  xrayServices?: boolean;

  // Boarding specific
  accommodationType?: string;
  playTime?: string;
  mealPlans?: string;
  medicationSupport?: boolean;
  groomingServices?: boolean;
  outdoorAccess?: boolean;
  cameraAccess?: boolean;
}

interface ServiceCardProps {
  id: string;
  name: string;
  image: string;
  category: string;
  description: string;
  location: string;
  rating: number;
  featured?: boolean;
  petTypes?: string[];
  price?: string | number;
  provider?: Provider;
  serviceDetails?: ServiceDetails;
  collectionName?: string;
}
export const ServiceCard = ({
  id,
  name,
  image,
  category,
  description,
  location,
  rating,
  featured = false,
  petTypes = [],
  price,
  provider,
  serviceDetails,
  collectionName
}: ServiceCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [existingBooking, setExistingBooking] = useState(null);
  const [checkingBooking, setCheckingBooking] = useState(false);

  const { user } = useAuth();
  const { activePet } = useContext(PetContext);

  // Check for existing booking when component mounts or active pet changes
  useEffect(() => {
    checkExistingBooking();
  }, [activePet, user]);

  const checkExistingBooking = async () => {
    if (!activePet || !user || (collectionName !== 'vets' && collectionName !== 'veterinary')) {
      return;
    }

    setCheckingBooking(true);
    try {
      const response = await fetch(`/api/vet-bookings/check?petId=${activePet.id}&serviceName=${encodeURIComponent(name)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsBooked(data.hasBooking);
        setExistingBooking(data.booking);
      }
    } catch (error) {
      console.error('Error checking booking status:', error);
    } finally {
      setCheckingBooking(false);
    }
  };

  const handleBookingSuccess = () => {
    setShowSuccessMessage(true);
    setIsBooked(true);
    checkExistingBooking(); // Refresh booking status
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  // Function to render specialized information based on service type
  const renderSpecializedInfo = () => {
    const serviceType = collectionName?.toLowerCase();

    switch (serviceType) {
      case 'trainers':
        return (
          <div className="mt-2 space-y-1">
            {serviceDetails?.serviceName && (
              <div className="text-xs text-purple-400 font-semibold">
                Training: {serviceDetails.serviceName}
              </div>
            )}
            {serviceDetails?.duration && (
              <div className="text-xs text-green-400">
                Duration: {serviceDetails.duration}
              </div>
            )}
            {serviceDetails?.description && (
              <div className="text-xs text-gray-300 line-clamp-2">
                {serviceDetails.description}
              </div>
            )}
            <div className="flex gap-2 text-xs">
              {serviceDetails?.privateSessions && (
                <span className="text-blue-400">Private Sessions</span>
              )}
              {serviceDetails?.homeVisits && (
                <span className="text-yellow-400">Home Visits</span>
              )}
              <span className="text-purple-400">Training Service</span>
            </div>
          </div>
        );

      case 'walkers':
        return (
          <div className="mt-2 space-y-1">
            {serviceDetails?.walkDuration && (
              <div className="text-xs text-green-400">
                Walk Duration: {serviceDetails.walkDuration}
              </div>
            )}
            {serviceDetails?.walkingAreas && serviceDetails.walkingAreas.length > 0 && (
              <div className="text-xs text-gray-300">
                Areas: {serviceDetails.walkingAreas.slice(0, 2).join(', ')}
              </div>
            )}
            <div className="flex gap-2 text-xs">
              {serviceDetails?.groupWalks && (
                <span className="text-green-400">Group Walks</span>
              )}
              {serviceDetails?.soloWalks && (
                <span className="text-blue-400">Solo Walks</span>
              )}
              {serviceDetails?.pickupDropoff && (
                <span className="text-yellow-400">Pickup/Dropoff</span>
              )}
            </div>
            {serviceDetails?.maxPetsPerWalk && (
              <div className="text-xs text-orange-400">
                Max pets per walk: {serviceDetails.maxPetsPerWalk}
              </div>
            )}
          </div>
        );

      case 'ngos':
        return (
          <div className="mt-2 space-y-1">
            {serviceDetails?.adoptionServices && (
              <div className="text-xs text-pink-400 font-semibold">
                ���️ Adoption Services Available
              </div>
            )}
            {serviceDetails?.availableForAdoption && serviceDetails.availableForAdoption.length > 0 && (
              <div className="text-xs text-green-400">
                {serviceDetails.availableForAdoption.length} animals available for adoption
              </div>
            )}
            {serviceDetails?.rescueTypes && serviceDetails.rescueTypes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {serviceDetails.rescueTypes.slice(0, 3).map(type => (
                  <span key={type} className="text-xs px-1.5 py-0.5 bg-pink-700 text-pink-200 rounded">
                    {type}
                  </span>
                ))}
              </div>
            )}
            {serviceDetails?.adoptionFee && (
              <div className="text-xs text-yellow-400">
                Adoption Fee: {serviceDetails.adoptionFee}
              </div>
            )}
            {serviceDetails?.volunteerOpportunities && serviceDetails.volunteerOpportunities.length > 0 && (
              <div className="text-xs text-blue-400">
                Volunteer: {serviceDetails.volunteerOpportunities.slice(0, 2).join(', ')}
              </div>
            )}
          </div>
        );

      case 'vets':
      case 'veterinary':
        return null;

      case 'boardings':
      case 'boarding':
        return (
          <div className="mt-2 space-y-1">
            {serviceDetails?.accommodationType && (
              <div className="text-xs text-indigo-400">
                Accommodation: {serviceDetails.accommodationType}
              </div>
            )}
            {serviceDetails?.playTime && (
              <div className="text-xs text-green-400">
                Play Time: {serviceDetails.playTime}
              </div>
            )}
            <div className="flex flex-wrap gap-1 mt-1">
              {serviceDetails?.groomingServices && (
                <span className="text-xs px-1.5 py-0.5 bg-pink-700 text-pink-200 rounded">
                  Grooming
                </span>
              )}
              {serviceDetails?.pickupDropoff && (
                <span className="text-xs px-1.5 py-0.5 bg-blue-700 text-blue-200 rounded">
                  Pickup/Dropoff
                </span>
              )}
              {serviceDetails?.outdoorAccess && (
                <span className="text-xs px-1.5 py-0.5 bg-green-700 text-green-200 rounded">
                  Outdoor Access
                </span>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const serviceData = {
    id,
    name,
    image,
    category,
    description,
    location,
    rating,
    featured,
    petTypes,
    price,
    provider,
    serviceDetails,
    collectionName
  };
  return <div className={`bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border ${featured ? 'border-amber-500' : 'border-gray-700'}`}>
      <div className="relative">
        <img src={image} alt={name} className="w-full h-32 object-cover" />
        {featured && <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Featured
          </div>}
        <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-80 text-xs font-bold px-2 py-1 rounded-full text-rose-400">
          {category}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-white text-base">{name}</h3>
        <div className="text-sm text-rose-400 font-medium">{category}</div>

        {/* Business Provider Name */}
        {provider && (
          <div className="mt-2 text-sm font-medium text-blue-300">
            Provider: {provider.businessName}
          </div>
        )}

        {/* Price and Duration */}
        <div className="mt-2 space-y-1">
          {price && (
            <div className="text-sm text-green-400 font-semibold">
              Price: {typeof price === 'number' ? `$${price}` : `$${price}`}
            </div>
          )}
          {serviceDetails?.duration && (
            <div className="text-sm text-gray-300">
              Duration: {serviceDetails.duration}
            </div>
          )}
        </div>

        {/* Specialized Service Information */}
        {renderSpecializedInfo()}

        {/* Service Badges */}
        <div className="flex flex-wrap gap-1 mt-2">
          {serviceDetails?.appointmentRequired && (
            <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full">
              Appointment Required
            </span>
          )}
          {serviceDetails?.isEmergency && (
            <span className="text-xs px-2 py-0.5 bg-red-600 text-white rounded-full">
              Emergency
            </span>
          )}
          {serviceDetails?.emergency24Hrs && (
            <span className="text-xs px-2 py-0.5 bg-orange-600 text-white rounded-full">
              24/7
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {petTypes.map(pet => <span key={pet} className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full">
              {pet}
            </span>)}
        </div>

        <div className="flex items-center mt-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => <StarIcon key={i} size={14} className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'} />)}
          </div>
          <span className="text-xs text-gray-400 ml-1">
            ({provider?.totalReviews || Math.floor(Math.random() * 50) + 5} reviews)
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-400 line-clamp-2">{description}</p>

        <div className="mt-3 space-y-2">
          <div className="flex space-x-2">
            <Button
              className="flex-1 text-sm py-1.5"
              onClick={() => setShowModal(true)}
            >
              View Details
            </Button>
            <Button variant="outline" className="px-2" title="Contact Provider">
              <MailIcon size={16} />
            </Button>
          </div>
          {(collectionName === 'vets' || collectionName === 'veterinary') && (
            <div className="space-y-1">
              {checkingBooking ? (
                <Button
                  className="w-full text-sm py-1.5 bg-gray-600"
                  disabled
                >
                  Checking...
                </Button>
              ) : isBooked ? (
                <div className="space-y-1">
                  <Button
                    className="w-full text-sm py-1.5 bg-green-600 hover:bg-green-700"
                    disabled
                  >
                    <CheckCircleIcon size={16} className="mr-2" />
                    Appointment Scheduled
                  </Button>
                  {existingBooking && (
                    <div className="text-xs text-green-400 text-center">
                      {existingBooking.appointmentTime
                        ? new Date(existingBooking.appointmentTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) + ' at ' + new Date(existingBooking.appointmentTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })
                        : (existingBooking.date && existingBooking.time)
                          ? `${new Date(existingBooking.date).toLocaleDateString()} at ${existingBooking.time}`
                          : 'Appointment scheduled'
                      }
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  className="w-full text-sm py-1.5 bg-rose-600 hover:bg-rose-700"
                  onClick={() => setShowBookingModal(true)}
                  disabled={!activePet || !user}
                >
                  {!activePet ? 'Select Pet First' : !user ? 'Login to Book' : 'Book Now'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 border border-green-500">
          <div className="flex items-center">
            <div className="mr-3">✓</div>
            <div>
              <div className="font-semibold">Booking Confirmed!</div>
              <div className="text-sm opacity-90">Your vet appointment has been scheduled successfully.</div>
            </div>
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {showModal && (
        <ServiceDetailsModal
          service={serviceData}
          onClose={() => setShowModal(false)}
          onBookNow={(collectionName === 'vets' || collectionName === 'veterinary') ?
            () => {
              setShowModal(false);
              setShowBookingModal(true);
            } : undefined
          }
        />
      )}

      {/* Vet Booking Modal */}
      {showBookingModal && (
        <VetBookingModal
          service={serviceData}
          onClose={() => setShowBookingModal(false)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>;
};
