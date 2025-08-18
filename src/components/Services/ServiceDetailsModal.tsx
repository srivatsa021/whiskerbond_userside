import React, { useState, useContext } from "react";
import {
  XIcon,
  MapPinIcon,
  StarIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  CheckIcon,
  XCircleIcon,
  ExternalLinkIcon,
  CalendarIcon,
  HeartIcon,
} from "lucide-react";
import { Button } from "../UI/Button";
import { useAuth } from "../Auth/AuthContext";
import { PetContext } from "../Pets/PetContext";

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
  collectionName?: string;
  serviceDetails?: {
    duration?: string;
    availability?: string;
    requirements?: string;
    includes?: string;
    excludes?: string;
    appointmentRequired?: boolean;
    isEmergency?: boolean;
    emergency24Hrs?: boolean;
  };
}

interface ServiceDetailsModalProps {
  service: Service;
  onClose: () => void;
  onBookingSuccess?: () => void;
}

export const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  service,
  onClose,
  onBookingSuccess,
}) => {
  const { user } = useAuth();
  const { activePet } = useContext(PetContext);

  // Booking state
  const [showBookingSection, setShowBookingSection] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if this is a vet service that can be booked
  const isVetService =
    service.collectionName === "vets" ||
    service.collectionName === "veterinary";

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
          value: date.toISOString().split("T")[0],
          label: date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
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
          value: time.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          label: time.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        });
      }
    }
    return slots;
  };

  const availableDates = generateAvailableDates();
  const timeSlots = generateTimeSlots();

  const handleBooking = async () => {
    if (!activePet) {
      setError("Please select a pet before booking.");
      return;
    }

    if (!user) {
      setError("Please log in to book a service.");
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError("Please select both date and time.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Check for existing booking first
      const checkResponse = await fetch(
        `/api/vet-bookings/check?petId=${
          activePet.id
        }&serviceName=${encodeURIComponent(service.name)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.hasBooking) {
          setError(
            "You already have an active appointment for this service. Please wait for it to be completed or cancelled before booking again."
          );
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
        provider: service.provider?.businessName || "Unknown Provider",
        providerId: service.provider?.id || null,
        serviceId: service.id,
        price:
          typeof service.price === "number"
            ? service.price
            : parseFloat(
                service.price?.toString().replace(/[^0-9.]/g, "") || "0"
              ),
        duration: service.serviceDetails?.duration || "Not specified",
        date: selectedDate,
        time: selectedTime,
        notes: notes.trim(),
        symptoms: symptoms.trim(),
        isEmergency,
        status: "confirmed",
      };

      const response = await fetch("/api/vet-bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      const result = await response.json();
      console.log("Booking created:", result);

      if (onBookingSuccess) {
        onBookingSuccess();
      }
      onClose();
    } catch (err) {
      console.error("Booking error:", err);
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={(e) => {
          // Prevent modal from closing when clicking inside the modal content
          e.stopPropagation();
        }}
      >
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
              <h1 className="text-2xl font-bold text-white mb-2">
                {service.name}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        size={18}
                        className={
                          i < service.rating!
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-600"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400 ml-2">
                    {service.rating}/5 ({service.provider?.totalReviews || 25}{" "}
                    reviews)
                  </span>
                </div>
                {service.price && (
                  <span className="text-xl font-bold text-rose-400">
                    {typeof service.price === "number"
                      ? `$${service.price}`
                      : service.price}
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
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Service Description
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Pet Types */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Suitable For
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {service.petTypes?.map((pet) => (
                      <span
                        key={pet}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                      >
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
                        <p className="text-gray-300">
                          {service.serviceDetails.duration}
                        </p>
                      </div>
                    )}

                    {service.serviceDetails.availability && (
                      <div>
                        <h4 className="text-md font-semibold text-white mb-2">
                          Availability
                        </h4>
                        <p className="text-gray-300">
                          {service.serviceDetails.availability}
                        </p>
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
                          <CheckIcon
                            size={16}
                            className="mr-2 text-green-400"
                          />
                          What's Included
                        </h4>
                        <p className="text-gray-300">
                          {service.serviceDetails.includes}
                        </p>
                      </div>
                    )}

                    {service.serviceDetails.requirements && (
                      <div>
                        <h4 className="text-md font-semibold text-white mb-2">
                          Requirements
                        </h4>
                        <p className="text-gray-300">
                          {service.serviceDetails.requirements}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Provider Information */}
              <div className="space-y-6">
                {service.provider && (
                  <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Service Provider
                    </h3>

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
                          <MapPinIcon
                            size={14}
                            className="mr-2 text-gray-400"
                          />
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
                            <ExternalLinkIcon
                              size={14}
                              className="mr-2 text-gray-400"
                            />
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
                                  className={
                                    i < (service.provider?.rating || 0)
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-gray-600"
                                  }
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
                  {isVetService ? (
                    <div className="space-y-4">
                      {!showBookingSection ? (
                        <div className="space-y-3">
                          <Button
                            onClick={() => setShowBookingSection(true)}
                            disabled={!user || !activePet}
                          >
                            {!user
                              ? "Login to Book"
                              : !activePet
                              ? "Select Pet First"
                              : "Book Now"}
                          </Button>
                          <Button variant="outline">Contact Provider</Button>
                          <Button variant="outline">Save to Favorites</Button>
                        </div>
                      ) : (
                        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 border border-gray-600">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <CalendarIcon
                              size={18}
                              className="mr-2 text-rose-400"
                            />
                            Book Appointment
                          </h3>

                          {/* Pet and User Info */}
                          <div className="bg-gray-600 bg-opacity-50 rounded-lg p-3 mb-4">
                            <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                              <HeartIcon
                                size={16}
                                className="mr-2 text-rose-400"
                              />
                              Booking Details
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-400">Pet:</span>
                                <span className="text-white ml-2">
                                  {activePet
                                    ? `${activePet.name} (${activePet.type})`
                                    : "No pet selected"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Pet Parent:
                                </span>
                                <span className="text-white ml-2">
                                  {user?.name || "Not logged in"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Date Selection */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2 flex items-center">
                              <CalendarIcon
                                size={14}
                                className="mr-2 text-blue-400"
                              />
                              Select Date
                            </label>
                            <div className="grid grid-cols-3 gap-2 max-h-24 overflow-y-auto">
                              {availableDates.map((date) => (
                                <button
                                  key={date.value}
                                  className={`p-2 text-xs rounded-lg border transition-colors ${
                                    selectedDate === date.value
                                      ? "bg-rose-600 border-rose-600 text-white"
                                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                                  }`}
                                  onClick={() => setSelectedDate(date.value)}
                                >
                                  {date.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Time Selection */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2 flex items-center">
                              <ClockIcon
                                size={14}
                                className="mr-2 text-green-400"
                              />
                              Select Time
                            </label>
                            <div className="grid grid-cols-4 gap-2 max-h-24 overflow-y-auto">
                              {timeSlots.map((slot) => (
                                <button
                                  key={slot.value}
                                  className={`p-2 text-xs rounded-lg border transition-colors ${
                                    selectedTime === slot.value
                                      ? "bg-rose-600 border-rose-600 text-white"
                                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                                  }`}
                                  onClick={() => setSelectedTime(slot.value)}
                                >
                                  {slot.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Additional Information */}
                          <div className="mb-4 space-y-3">
                            {/* Notes */}
                            <div>
                              <label className="block text-xs font-medium text-white mb-1">
                                Notes (Optional)
                              </label>
                              <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any special instructions..."
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none text-xs"
                                rows={2}
                              />
                            </div>

                            {/* Symptoms */}
                            <div>
                              <label className="block text-xs font-medium text-white mb-1">
                                Symptoms or Concerns (Optional)
                              </label>
                              <textarea
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                placeholder="Describe any symptoms..."
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none text-xs"
                                rows={2}
                              />
                            </div>

                            {/* Emergency Checkbox */}
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="isEmergency"
                                checked={isEmergency}
                                onChange={(e) =>
                                  setIsEmergency(e.target.checked)
                                }
                                className="w-4 h-4 text-rose-600 bg-gray-700 border-gray-600 rounded focus:ring-rose-500 focus:ring-2"
                              />
                              <label
                                htmlFor="isEmergency"
                                className="text-xs text-white cursor-pointer"
                              >
                                This is an emergency appointment
                              </label>
                            </div>
                          </div>

                          {/* Error Display */}
                          {error && (
                            <div className="mb-3 p-2 bg-red-900 bg-opacity-50 border border-red-600 rounded-lg text-red-200 text-xs">
                              {error}
                            </div>
                          )}

                          {/* Booking Summary */}
                          {selectedDate && selectedTime && (
                            <div className="mb-4 p-3 bg-green-900 bg-opacity-30 border border-green-600 rounded-lg">
                              <h4 className="text-xs font-semibold text-green-300 mb-2">
                                Booking Summary
                              </h4>
                              <div className="text-xs text-green-200 space-y-1">
                                <div>
                                  <span className="font-medium">Service:</span>{" "}
                                  {service.name}
                                </div>
                                <div>
                                  <span className="font-medium">Date:</span>{" "}
                                  {new Date(selectedDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </div>
                                <div>
                                  <span className="font-medium">Time:</span>{" "}
                                  {selectedTime}
                                </div>
                                <div>
                                  <span className="font-medium">Pet:</span>{" "}
                                  {activePet?.name}
                                </div>
                                <div>
                                  <span className="font-medium">Duration:</span>{" "}
                                  {service.serviceDetails?.duration ||
                                    "Not specified"}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Booking Action Buttons */}
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setShowBookingSection(false)}
                              disabled={isLoading}
                            >
                              Back
                            </Button>
                            <Button
                              onClick={handleBooking}
                              disabled={
                                isLoading ||
                                !selectedDate ||
                                !selectedTime ||
                                !activePet ||
                                !user
                              }
                            >
                              {isLoading ? "Booking..." : "Confirm Booking"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button>Book This Service</Button>
                      <Button variant="outline">Contact Provider</Button>
                      <Button variant="outline">Save to Favorites</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
