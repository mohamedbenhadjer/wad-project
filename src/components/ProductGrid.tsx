import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for best deals
const bestDeals = [
  {
    id: "1",
    title: "PlayStation 5 Digital Edition",
    price: 399.99,
    oldPrice: 499.99,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.8,
    reviewCount: 354,
    badge: "sale" as const,
    discount: 20,
  },
  {
    id: "2",
    title: "DJI Mini 3 Pro Drone with 4K Camera",
    price: 749.99,
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.6,
    reviewCount: 212,
    badge: "new" as const,
  },
  {
    id: "3",
    title: "Samsung Galaxy S22 Ultra 256GB",
    price: 999.99,
    oldPrice: 1199.99,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.7,
    reviewCount: 482,
    badge: "sale" as const,
    discount: 16,
  },
  {
    id: "4",
    title: "PlayStation 5 DualSense Wireless Controller",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.9,
    reviewCount: 621,
    badge: "hot" as const,
  },
  {
    id: "5",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    price: 349.99,
    oldPrice: 399.99,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.8,
    reviewCount: 346,
    badge: "sale" as const,
    discount: 12,
  },
  {
    id: "6",
    title: "Apple AirPods Pro (2nd Generation)",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.7,
    reviewCount: 528,
  },
  {
    id: "7",
    title: "DJI Mini 2 SE Drone",
    price: 299.99,
    oldPrice: 349.99,
    image: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.5,
    reviewCount: 183,
    badge: "sale" as const,
    discount: 14,
  },
  {
    id: "8",
    title: "Apple MacBook Air M2 Chip",
    price: 1199.99,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.9,
    reviewCount: 256,
    badge: "new" as const,
  },
];

interface ProductGridProps {
  title: string;
  viewAllLink?: string;
  products?: any[];
  showControls?: boolean;
}

const ProductGrid = ({ 
  title, 
  viewAllLink, 
  products = bestDeals,
  showControls = true 
}: ProductGridProps) => {
  const productsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(products.length / productsPerPage);
  
  // Log products received by this component
  useEffect(() => {
    console.log('ProductGrid received products:', products.length, products);
  }, [products]);
  
  // Calculate visible products based on currentPage
  const visibleProducts = showControls
    ? products.slice(currentPage * productsPerPage, (currentPage + 1) * productsPerPage)
    : products;
    
  console.log('Visible products:', visibleProducts.length, visibleProducts);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">{title}</h2>
          
          <div className="flex items-center">
            {viewAllLink && (
              <Link
                to={viewAllLink}
                className="text-sm font-medium text-brand-blue hover:underline mr-4"
              >
                View All
                <ChevronRight className="inline-block h-4 w-4 ml-1" />
              </Link>
            )}
            
            {showControls && totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="w-8 h-8 rounded border border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                  className="w-8 h-8 rounded border border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={product.id || index}
              {...product}
              className={`stagger-item`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
