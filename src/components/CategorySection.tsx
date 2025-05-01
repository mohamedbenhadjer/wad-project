
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Mock data for categories
const categories = [
  {
    id: "1",
    name: "Computer & Laptop",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&h=300&q=80",
    count: 124,
  },
  {
    id: "2",
    name: "Mobile & Tablet",
    image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=300&h=300&q=80",
    count: 267,
  },
  {
    id: "3",
    name: "Headphones",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=300&h=300&q=80",
    count: 89,
  },
  {
    id: "4",
    name: "Smart Watch",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=300&h=300&q=80",
    count: 56,
  },
  {
    id: "5",
    name: "Camera & Photo",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&h=300&q=80",
    count: 112,
  },
  {
    id: "6",
    name: "TV & Home Cinema",
    image: "https://images.unsplash.com/photo-1593784991095-a205069533b8?auto=format&fit=crop&w=300&h=300&q=80",
    count: 74,
  },
];

const CategorySection = () => {
  const [startIndex, setStartIndex] = useState(0);
  const itemsToShow = window.innerWidth >= 1024 ? 6 : window.innerWidth >= 768 ? 4 : 2;
  const visibleCategories = categories.slice(startIndex, startIndex + itemsToShow);

  const nextSlide = () => {
    if (startIndex + itemsToShow < categories.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  return (
    <section className="py-12 bg-brand-light">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="section-title text-center mb-10">Shop with Categories</h2>
        
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {visibleCategories.map((category) => (
              <a 
                key={category.id} 
                href={`#category-${category.id}`} 
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group stagger-item"
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-medium text-brand-dark text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.count} items</p>
                </div>
              </a>
            ))}
          </div>
          
          {/* Navigation buttons */}
          <button 
            onClick={prevSlide} 
            disabled={startIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronLeft className="h-5 w-5 text-brand-dark" />
          </button>
          
          <button 
            onClick={nextSlide} 
            disabled={startIndex + itemsToShow >= categories.length}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronRight className="h-5 w-5 text-brand-dark" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
