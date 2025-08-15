import React from 'react';
import { XIcon, MapPinIcon, StarIcon, PhoneIcon, MailIcon, ClockIcon, CheckIcon, XCircleIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '../UI/Button';

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

interface Service {
  id: string;
  name: string;
  image?: string;
  category: string;
  description: string;
  location?: string;
  rating?: number;
  featured?: boolean;
  petTypes?: string[];
  price?: string | number;
  provider?: Provider;
  serviceDetails?: {
    duration?: string;
    availability?: string;
    requirements?: string;
    includes?: string;
    excludes?: string;
  };
}

interface ServiceDetailsModalProps {
  service: Service;
  onClose: () => void;
  onBookNow?: () => void;
}

export const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({ service, onClose, onBookNow }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="relative">
          {/* Header Image */}
          <div className="relative h-48 overflow-hidden rounded-t-xl">
            <img 
              src={service.image} 
              alt={service.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2" 
              onClick={onClose}
            >
              <XIcon size={20} />
            </button>
            {service.featured && (
              <div className="absolute top-4 left-4 bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                Featured Service
              </div>
            )}
            <div className="absolute bottom-4 left-4">
              <span className="bg-rose-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {service.category}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Service Title and Rating */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">{service.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon 
                        key={i} 
                        size={18} 
                        className={i < service.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-600'} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400 ml-2">
                    {service.rating}/5 ({service.provider?.totalReviews || 25} reviews)
                  </span>
                </div>
                {service.price && (
                  <span className="text-xl font-bold text-rose-400">
                    {typeof service.price === 'number' ? `$${service.price}` : service.price}
                  </span>
                )}
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Service Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Service Description */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Service Description</h3>
                  <p className="text-gray-300 leading-relaxed">{service.description}</p>
                </div>

                {/* Pet Types */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Suitable For</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.petTypes?.map(pet => (
                      <span key={pet} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                        {pet}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Service Details */}
                {service.serviceDetails && (
                  <div className="space-y-4">
                    {service.serviceDetails.duration && (
                      <div>
                        <h4 className="text-md font-semibold text-white mb-2 flex items-center">
                          <ClockIcon size={16} className="mr-2 text-blue-400" />
                          Duration
                        </h4>
                        <p className="text-gray-300">{service.serviceDetails.duration}</p>
                      </div>
                    )}

                    {service.serviceDetails.availability && (
                      <div>
                        <h4 className="text-md font-semibold text-white mb-2">Availability</h4>
                        <p className="text-gray-300">{service.serviceDetails.availability}</p>
                      </div>
                    )}

                    {/* Appointment and Emergency Info */}
                    <div className="flex gap-4">
                      {service.serviceDetails.appointmentRequired && (
                        <div className="flex items-center text-sm text-blue-400">
                          <CheckIcon size={16} className="mr-2" />
                          Appointment Required
                        </div>
                      )}
                      {service.serviceDetails.isEmergency && (
                        <div className="flex items-center text-sm text-red-400">
                          <XCircleIcon size={16} className="mr-2" />
                          Emergency Service
                        </div>
                      )}
                      {service.serviceDetails.emergency24Hrs && (
                        <div className="flex items-center text-sm text-orange-400">
                          <ClockIcon size={16} className="mr-2" />
                          24/7 Available
                        </div>
                      )}
                    </div>

                    {service.serviceDetails.includes && (
                      <div>
                        <h4 className="text-md font-semibold text-white mb-2 flex items-center">
                          <CheckIcon size={16} className="mr-2 text-green-400" />
                          What's Included
                        </h4>
                        <p className="text-gray-300">{service.serviceDetails.includes}</p>
                      </div>
                    )}

                    {service.serviceDetails.requirements && (
                      <div>
                        <h4 className="text-md font-semibold text-white mb-2">Requirements</h4>
                        <p className="text-gray-300">{service.serviceDetails.requirements}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Provider Information */}
              <div className="space-y-6">
                {service.provider && (
                  <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-4">Service Provider</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-blue-300 text-lg">
                          {service.provider.businessName}
                        </h4>
                        {service.provider.establishedYear && (
                          <p className="text-sm text-gray-400">
                            Established {service.provider.establishedYear}
                          </p>
                        )}
                      </div>

                      <p className="text-sm text-gray-300">
                        {service.provider.businessDescription}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-300">
                          <MapPinIcon size={14} className="mr-2 text-gray-400" />
                          <span>{service.provider.businessAddress}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-300">
                          <PhoneIcon size={14} className="mr-2 text-gray-400" />
                          <span>{service.provider.contactPhone}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-300">
                          <MailIcon size={14} className="mr-2 text-gray-400" />
                          <span>{service.provider.contactEmail}</span>
                        </div>

                        {service.provider.website && (
                          <div className="flex items-center text-sm text-blue-300">
                            <ExternalLinkIcon size={14} className="mr-2 text-gray-400" />
                            <a 
                              href={service.provider.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-blue-200"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>

                      {service.provider.rating && (
                        <div className="pt-3 border-t border-gray-600">
                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon 
                                  key={i} 
                                  size={14} 
                                  className={i < service.provider.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-600'} 
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400 ml-2">
                              Provider Rating
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {onBookNow ? (
                    <Button
                      className="w-full bg-rose-600 hover:bg-rose-700"
                      onClick={onBookNow}
                    >
                      Book Now
                    </Button>
                  ) : (
                    <Button className="w-full">
                      Book This Service
                    </Button>
                  )}
                  <Button variant="outline" className="w-full">
                    Contact Provider
                  </Button>
                  <Button variant="outline" className="w-full">
                    Save to Favorites
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
