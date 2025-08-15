import React, { useState, useContext, useEffect } from 'react';
import { ServiceCard } from './ServiceCard';
import { SearchIcon, MapPinIcon } from 'lucide-react';
import { Button } from '../UI/Button';
import { PetContext } from '../Pets/PetContext';
interface ServicesSectionProps {
  featured?: boolean;
}

interface Provider {
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
  collectionName?: string;
  price?: string | number;
  provider?: Provider;
  serviceDetails?: {
    duration?: string;
    availability?: string;
    requirements?: string;
    includes?: string;
    excludes?: string;
  };
  originalData?: any;
}

interface ServiceCategory {
  categoryName: string;
  services: Service[];
  count: number;
}

interface ApiResponse {
  allServices: Service[];
  categories: Record<string, ServiceCategory>;
  totalServices: number;
  totalCategories: number;
}
export const ServicesSection = ({
  featured = false
}: ServicesSectionProps) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Record<string, ServiceCategory>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    activePet
  } = useContext(PetContext);

  // Manual retry function
  const retryFetch = () => {
    console.log('Manual retry triggered');
    setError(null);
    setLoading(true);
    fetchServices(1, 3); // Use 3 attempts for manual retry
  };
  // Fetch services from API with simplified retry logic
  const fetchServices = async (attempt = 1, maxAttempts = 3) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching services (attempt ${attempt}/${maxAttempts})`);

      // Add connectivity check for cloud environment
      if (attempt === 1) {
        console.log('Starting services fetch...');
        try {
          // Quick connectivity test
          const healthResponse = await fetch('/api/health', {
            method: 'GET',
            signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : controller.signal,
          });
          console.log('Health check:', healthResponse.status === 200 ? 'OK' : 'Failed');
        } catch (healthError) {
          console.warn('Health check failed, proceeding with services fetch:', healthError);
        }
      }

      const response = await fetch('/api/services', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      console.log('Services data received:', data);
      console.log('Categories received:', Object.keys(data.categories || {}));
      console.log('Services count per category:', Object.fromEntries(
        Object.entries(data.categories || {}).map(([key, cat]) => [key, cat.count])
      ));

      setAllServices(data.allServices || []);
      setCategories(data.categories || {});
      setError(null);
      setLoading(false);

      console.log('Services loaded successfully');

    } catch (err) {
      clearTimeout(timeoutId);
      console.error(`Error fetching services (attempt ${attempt}):`, err);

      if (attempt < maxAttempts) {
        // Exponential backoff for cloud environment stability
        const delay = Math.min(2000 * Math.pow(1.5, attempt - 1), 10000);
        console.log(`Retrying in ${delay/1000} seconds... (${maxAttempts - attempt} attempts left)`);
        setTimeout(() => {
          fetchServices(attempt + 1, maxAttempts);
        }, delay);
        return;
      }

      // Final attempt failed
      let errorMessage = 'Unable to load services';
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timeout. Please try again.';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Network connection issue. The server may be starting up. Please try again in a moment.';
        } else if (err.message.includes('HTTP')) {
          errorMessage = `Server error: ${err.message}`;
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);

      // Provide fallback data so the page is not completely empty
      const fallbackServices = [
        {
          id: 'fallback-1',
          name: 'Pet Training Services',
          category: 'Training',
          description: 'Professional pet training and behavior modification services',
          location: 'WhiskerBond Services',
          rating: 4,
          image: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          featured: false,
          petTypes: ['Dog', 'Cat'],
          collectionName: 'fallback'
        },
        {
          id: 'fallback-2',
          name: 'Pet Grooming',
          category: 'Grooming',
          description: 'Complete grooming services for all types of pets',
          location: 'WhiskerBond Services',
          rating: 5,
          image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          featured: false,
          petTypes: ['Dog', 'Cat'],
          collectionName: 'fallback'
        }
      ];

      setAllServices(fallbackServices);
      setCategories({
        'fallback': {
          categoryName: 'Sample Services',
          services: fallbackServices,
          count: fallbackServices.length
        }
      });
      setLoading(false);

      console.error('All attempts failed. Using fallback data.');
    }
  };

  useEffect(() => {
    // Add delay for cloud environment to ensure backend is ready
    const initializeServices = async () => {
      try {
        // Wait longer for the cloud environment to stabilize
        await new Promise(resolve => setTimeout(resolve, 2000));
        fetchServices();
      } catch (error) {
        console.error('Error initializing services:', error);
        // Fallback with even longer delay
        setTimeout(() => {
          fetchServices();
        }, 5000);
      }
    };

    initializeServices();
  }, []);

  // Dynamic categories based on fetched data
  const getCategoryOptions = () => {
    const categoryKeys = Object.keys(categories);
    const categoryOptions = [
      { id: 'all', name: 'All Services' },
      ...categoryKeys.map(key => ({
        id: key,
        name: categories[key].categoryName
      }))
    ];
    return categoryOptions;
  };

  const categoryOptions = getCategoryOptions();

  // Get services based on active category
  const getDisplayServices = () => {
    let servicesToDisplay: Service[] = [];

    if (activeCategory === 'all') {
      servicesToDisplay = allServices;
    } else if (categories[activeCategory]) {
      servicesToDisplay = categories[activeCategory].services;
    }

    // Apply filters
    return servicesToDisplay.filter(service => {
      if (featured && !service.featured) return false;
      if (activePet && service.petTypes && !service.petTypes.includes(activePet.type)) return false;
      return true;
    });
  };

  const filteredServices = getDisplayServices();
  return <section className="py-12 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">
            {featured ? `Top-rated ${activePet ? `${activePet.type}` : 'Pet'} Services` : 'Find Pet Services'}
          </h2>
          <p className="text-gray-400 mt-2">
            {featured ? `Discover our most loved and trusted ${activePet ? activePet.type.toLowerCase() : 'pet'} service providers` : `Connect with professional ${activePet ? activePet.type.toLowerCase() : 'pet'} service providers in your area`}
          </p>
        </div>
        {!featured && <div className="mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-800 rounded-xl border border-gray-700">
              <div className="relative flex-grow">
                <input type="text" placeholder="Search services..." className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative flex-grow">
                <input type="text" placeholder="Location" className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                <MapPinIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <Button size="lg" className="w-full md:w-auto">
                Find Services
              </Button>
            </div>
            <div className="flex overflow-x-auto py-4 scrollbar-hide">
              {categoryOptions.map(category => <button key={category.id} className={`px-4 py-2 mr-2 rounded-full whitespace-nowrap ${activeCategory === category.id ? 'bg-rose-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} onClick={() => setActiveCategory(category.id)}>
                  {category.name}
                  {category.id !== 'all' && categories[category.id] && (
                    <span className="ml-1 text-xs opacity-75">({categories[category.id].count})</span>
                  )}
                </button>)}
            </div>
          </div>}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading services...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <div className="text-red-400 text-lg font-semibold mb-2">Unable to Load Services</div>
              <p className="text-gray-400 text-sm mb-2">{error}</p>
              <p className="text-gray-500 text-xs mb-4">
                {error.includes('Network connection')
                  ? 'This may be a temporary connectivity issue in the cloud environment. The backend is running normally.'
                  : 'Showing sample services below. Click retry to load live data.'
                }
              </p>
            </div>
            <div className="space-x-3">
              <Button onClick={retryFetch} className="mb-4">
                🔄 Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mb-4"
              >
                🔃 Refresh Page
              </Button>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No services found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map(service => <ServiceCard key={service.id} {...service} />)}
          </div>
        )}
        {featured && <div className="text-center mt-10">
            <Button variant="outline" size="lg">
              View All Services
            </Button>
          </div>}
      </div>
    </section>;
};
