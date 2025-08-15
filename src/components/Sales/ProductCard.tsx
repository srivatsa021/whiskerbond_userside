import React from 'react';
import { StarIcon, ShoppingCartIcon, HeartIcon } from 'lucide-react';
import { Button } from '../UI/Button';
interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  category: string;
  featured?: boolean;
  petType?: string;
}
export const ProductCard = ({
  id,
  name,
  image,
  price,
  originalPrice,
  rating,
  category,
  featured = false,
  petType
}: ProductCardProps) => {
  const discount = originalPrice ? Math.round((originalPrice - price) / originalPrice * 100) : 0;
  return <div className={`bg-gray-700 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border ${featured ? 'border-amber-500' : 'border-gray-600'}`}>
      <div className="relative">
        <img src={image} alt={name} className="w-full h-28 sm:h-32 object-cover" />
        {discount > 0 && <div className="absolute top-1 left-1 bg-rose-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {discount}% OFF
          </div>}
        {featured && <div className="absolute top-1 right-1 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            Featured
          </div>}
        <button className="absolute bottom-1 right-1 p-1.5 bg-gray-800 bg-opacity-70 rounded-full shadow-md text-gray-300 hover:text-rose-500 transition-colors">
          <HeartIcon size={14} />
        </button>
      </div>
      <div className="p-2 sm:p-3">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-amber-400 uppercase">
            {category}
          </span>
          {petType && <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-gray-600 text-gray-300 text-[10px]">
              {petType}
            </span>}
        </div>
        <h3 className="font-medium text-white text-sm mt-1 line-clamp-1">
          {name}
        </h3>
        <div className="flex items-center mt-1.5">
          <div className="flex">
            {[...Array(5)].map((_, i) => <StarIcon key={i} size={12} className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-500'} />)}
          </div>
          <span className="text-xs text-gray-400 ml-1">
            ({Math.floor(Math.random() * 100) + 10})
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-sm font-bold text-white">
              ${price.toFixed(2)}
            </span>
            {originalPrice && <span className="text-xs text-gray-400 line-through ml-1">
                ${originalPrice.toFixed(2)}
              </span>}
          </div>
        </div>
        <Button className="w-full mt-2 py-1 h-auto text-xs" size="sm">
          <ShoppingCartIcon size={12} className="mr-1" />
          Add to Cart
        </Button>
      </div>
    </div>;
};