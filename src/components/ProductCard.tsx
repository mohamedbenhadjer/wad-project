import { Star, ShoppingCart, Heart } from "lucide-react";
import { formatPrice } from "@/utils/currency";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { Product } from "@/types/database.types";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  badge?: "new" | "hot" | "sale";
  discount?: number;
  className?: string;
  description?: string;
}

const ProductCard = ({
  id,
  title,
  price,
  oldPrice,
  image,
  rating = 0,
  reviewCount = 0,
  badge,
  discount,
  className = "",
  description = "",
}: ProductCardProps) => {
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);
  const { addToCart, addToWishlist, isInCart, isInWishlist } = useShop();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    
    // Convert to Product format for the context
    const product: Product = {
      id,
      name: title,
      price,
      image_url: imageError ? PLACEHOLDER_IMAGE : (image || PLACEHOLDER_IMAGE),
      description: description,
      // Add other required fields with default values
      category_id: "",
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      numeric_id: 0,
      in_stock: true
    };
    
    addToCart(product);
    
    toast({
      title: "Added to cart",
      description: `${title} has been added to your cart`,
    });
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    
    // Convert to Product format for the context
    const product: Product = {
      id,
      name: title,
      price,
      image_url: imageError ? PLACEHOLDER_IMAGE : (image || PLACEHOLDER_IMAGE),
      description: description,
      // Add other required fields with default values
      category_id: "",
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      numeric_id: 0,
      in_stock: true
    };
    
    addToWishlist(product);
    
    toast({
      title: "Added to wishlist",
      description: `${title} has been added to your wishlist`,
    });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Check if product is already in cart or wishlist
  const inCart = isInCart(id);
  const inWishlist = isInWishlist(id);

  return (
    <div className={`product-card group ${className}`}>
      <Link to={`/product/${id}`} className="block">
        <div className="relative overflow-hidden">
          {/* Badge */}
          {badge === "new" && <span className="absolute top-1 left-1 md:top-2 md:left-2 bg-blue-500 text-white text-xs md:text-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded">New</span>}
          {badge === "hot" && <span className="absolute top-1 left-1 md:top-2 md:left-2 bg-red-500 text-white text-xs md:text-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded">Hot</span>}
          {badge === "sale" && (
            <span className="absolute top-1 right-1 md:top-2 md:right-2 bg-green-500 text-white text-xs md:text-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">-{discount || 0}%</span>
          )}

          {/* Image */}
          <div className="aspect-square overflow-hidden">
            <img
              src={imageError ? PLACEHOLDER_IMAGE : (image || PLACEHOLDER_IMAGE)}
              alt={title || "Product"}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
            />
          </div>

          {/* Quick actions - Only show on desktop */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-opacity-10 transition-all duration-300">
            <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
              <button 
                className={`${inCart ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-orange hover:bg-brand-orange/90'} h-10 w-10 p-0 rounded-full flex items-center justify-center text-white`}
                onClick={handleAddToCart}
                aria-label={inCart ? "Added to cart" : "Add to cart"}
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
              <button 
                className={`${inWishlist ? 'bg-red-500 hover:bg-red-600' : 'border border-brand-orange text-brand-orange hover:bg-brand-orange/10'} h-10 w-10 p-0 rounded-full flex items-center justify-center`}
                onClick={handleAddToWishlist}
                aria-label={inWishlist ? "Added to wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 md:p-4">
          <h3 className="font-medium text-xs md:text-sm mb-0.5 md:mb-1 text-brand-dark line-clamp-2">
            {title || "Unnamed Product"}
          </h3>
          <div className="flex items-center mb-1 md:mb-2">
            <div className="flex items-center">
              {/* Show only 3 stars on mobile, 5 on larger screens */}
              <div className="md:hidden">
                {Array.from({ length: 3 }).map((_, i) => {
                  const starValue = i + 1;
                  const isFullStar = starValue <= Math.floor(rating);
                  const isHalfStar = !isFullStar && starValue <= Math.ceil(rating) && rating % 1 >= 0.5;

                  return (
                    <Star
                      key={i}
                      className={`h-2 w-2 ${
                        isFullStar 
                          ? "text-brand-yellow fill-brand-yellow" 
                          : isHalfStar 
                            ? "text-brand-yellow fill-[url('#half-star')]" 
                            : "text-gray-300"
                      }`}
                    />
                  );
                })}
              </div>
              <div className="hidden md:flex">
                {Array.from({ length: 5 }).map((_, i) => {
                  const starValue = i + 1;
                  const isFullStar = starValue <= Math.floor(rating);
                  const isHalfStar = !isFullStar && starValue <= Math.ceil(rating) && rating % 1 >= 0.5;
                  
                  return (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        isFullStar 
                          ? "text-brand-yellow fill-brand-yellow" 
                          : isHalfStar 
                            ? "text-brand-yellow fill-[url('#half-star')]" 
                            : "text-gray-300"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
            <span className="text-[10px] md:text-xs text-muted-foreground ml-1">({reviewCount})</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-xs md:text-base font-medium text-brand-orange">{formatPrice(price || 0)}</span>
              {oldPrice && (
                <span className="text-[10px] md:text-xs text-gray-500 line-through">{formatPrice(oldPrice)}</span>
              )}
            </div>
            <button 
              className={`${inCart ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-orange hover:bg-brand-orange/90'} h-6 w-6 md:h-8 md:w-8 p-0 rounded-full flex items-center justify-center text-white`}
              onClick={handleAddToCart}
              aria-label={inCart ? "Added to cart" : "Add to cart"}
            >
              <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
