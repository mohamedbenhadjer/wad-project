import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/database.types";
import { formatPrice } from "@/utils/currency";

interface HeroProps {
  product?: Product;
}

const Hero = ({ product }: HeroProps) => {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="container mx-auto px-4 py-8 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="order-2 md:order-1">
            <Badge 
              className="mb-3 bg-brand-orange text-white hover:bg-brand-orange/90"
            >
              {product?.featured ? "25% OFF" : "New Arrival"}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-dark mb-3">
              {product ? product.name : "Discover the Future of Technology"}
            </h1>
            <p className="text-base text-gray-600 mb-6 md:max-w-md">
              {product ? product.description : "Explore our latest collection of cutting-edge devices designed to transform your digital experience."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="default" className="bg-brand-orange hover:bg-brand-orange/90 text-white" asChild>
                <Link to={product ? `/product/${product.numeric_id || product.id}` : "/products"} className="flex items-center">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="default" variant="outline" className="border-brand-orange text-brand-orange hover:bg-brand-light hover:text-brand-orange/90" asChild>
                <Link to="/categories">
                  Explore Categories
                </Link>
              </Button>
            </div>
          </div>
          <div className="order-1 md:order-2 relative">
            <div className="h-72 max-w-md mx-auto md:max-w-md bg-brand-light relative overflow-hidden rounded-xl p-4">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-orange/10 to-transparent"></div>
              {product?.featured && (
                <div className="absolute top-3 right-3 bg-brand-orange text-white text-sm font-bold px-3 py-1.5 rounded-md shadow-md z-20">
                  25% OFF
                </div>
              )}
              <img 
                src="https://i.pinimg.com/736x/82/e2/bd/82e2bd6dca1e2dcc65fecaa3dbebed22.jpg" 
                alt={product?.name || "Featured Product"} 
                className="object-contain w-full h-full z-10 relative transform hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-brand-orange/20 rounded-full blur-xl"></div>
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-orange/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 shadow-sm rounded-lg border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="text-brand-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-brand-dark text-sm">Free shipping</h3>
                  <p className="text-xs text-gray-500">Across Algeria</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 shadow-sm rounded-lg border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="text-brand-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-brand-dark text-sm">24/7 Support</h3>
                  <p className="text-xs text-gray-500">Local assistance</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 shadow-sm rounded-lg border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="text-brand-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-brand-dark text-sm">Money back</h3>
                  <p className="text-xs text-gray-500">30 day guarantee</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 shadow-sm rounded-lg border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="text-brand-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-brand-dark text-sm">Secure payment</h3>
                  <p className="text-xs text-gray-500">Multiple options</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
