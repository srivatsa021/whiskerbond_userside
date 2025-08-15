import React, { useState, useContext } from 'react';
import { ProductCard } from './ProductCard';
import { FilterIcon, SearchIcon } from 'lucide-react';
import { Button } from '../UI/Button';
import { PetContext } from '../Pets/PetContext';
interface ProductsSectionProps {
  featured?: boolean;
}
export const ProductsSection = ({
  featured = false
}: ProductsSectionProps) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const {
    activePet
  } = useContext(PetContext);
  const categories = [{
    id: 'all',
    name: 'All Products'
  }, {
    id: 'food',
    name: 'Food & Treats'
  }, {
    id: 'toys',
    name: 'Toys'
  }, {
    id: 'grooming',
    name: 'Grooming'
  }, {
    id: 'accessories',
    name: 'Accessories'
  }];
  // Sample product data
  const products = [{
    id: '1',
    name: 'Premium Organic Dog Food',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    price: 49.99,
    originalPrice: 59.99,
    rating: 5,
    category: 'food',
    featured: true,
    petType: 'Dog'
  }, {
    id: '2',
    name: 'Interactive Cat Toy',
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    price: 19.99,
    rating: 4,
    category: 'toys',
    featured: true,
    petType: 'Cat'
  }, {
    id: '3',
    name: 'Professional Grooming Kit',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
    price: 34.99,
    originalPrice: 44.99,
    rating: 4,
    category: 'grooming',
    featured: false,
    petType: 'All'
  }, {
    id: '4',
    name: 'Stylish Pet Collar',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80',
    price: 14.99,
    rating: 5,
    category: 'accessories',
    featured: false,
    petType: 'Dog'
  }, {
    id: '5',
    name: 'Gourmet Cat Treats',
    image: 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    price: 9.99,
    originalPrice: 12.99,
    rating: 4,
    category: 'food',
    featured: true,
    petType: 'Cat'
  }, {
    id: '6',
    name: 'Dog Chew Toy Bundle',
    image: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    price: 24.99,
    rating: 3,
    category: 'toys',
    featured: false,
    petType: 'Dog'
  }, {
    id: '7',
    name: 'Pet Shampoo & Conditioner',
    image: 'https://images.unsplash.com/photo-1581888227599-779811939961?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    price: 17.99,
    rating: 5,
    category: 'grooming',
    featured: false,
    petType: 'All'
  }, {
    id: '8',
    name: 'Luxury Pet Bed',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80',
    price: 79.99,
    originalPrice: 99.99,
    rating: 5,
    category: 'accessories',
    featured: true,
    petType: 'All'
  }];
  // Filter products based on active category, featured flag, and active pet type
  const filteredProducts = products.filter(product => {
    if (featured && !product.featured) return false;
    if (activeCategory !== 'all' && product.category !== activeCategory) return false;
    if (activePet && product.petType !== 'All' && product.petType !== activePet.type) return false;
    return true;
  });
  return <section className="py-8 md:py-12 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {featured ? `${activePet ? `${activePet.name}'s` : 'Featured'} Products` : 'Shop Pet Products'}
          </h2>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            {featured ? `Discover our handpicked selection of premium ${activePet ? activePet.type.toLowerCase() : 'pet'} products` : `Quality products for your ${activePet ? activePet.type.toLowerCase() : 'furry, feathery, or scaly'} friends`}
          </p>
        </div>
        {!featured && <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div className="flex overflow-x-auto pb-2 mb-4 md:mb-0 scrollbar-hide">
                {categories.map(category => <button key={category.id} className={`px-3 py-1.5 mr-2 text-sm rounded-full whitespace-nowrap ${activeCategory === category.id ? 'bg-rose-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} onClick={() => setActiveCategory(category.id)}>
                    {category.name}
                  </button>)}
              </div>
              <div className="flex w-full md:w-auto">
                <div className="relative flex-grow mr-2">
                  <input type="text" placeholder="Search products..." className="w-full pl-8 pr-4 py-1.5 text-sm border border-gray-600 rounded-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                  <SearchIcon size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative">
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none text-sm pl-3 pr-8 py-1.5 border border-gray-600 rounded-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                    <option value="popular">Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                  <FilterIcon size={16} className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {filteredProducts.map(product => <ProductCard key={product.id} {...product} />)}
        </div>
        {featured && <div className="text-center mt-8">
            <Button variant="outline" size="md">
              View All Products
            </Button>
          </div>}
      </div>
    </section>;
};