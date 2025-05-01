import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/utils/currency";

interface FeaturedProductProps {
  title: string;
  description: string;
  price: number;
  image: string;
  badge?: string;
  isNew?: boolean;
  buttonText?: string;
  backgroundColor?: string;
}

const FeaturedProduct = ({
  title,
  description,
  price,
  image,
  badge = "FEATURED",
  isNew = false,
  buttonText = "Shop Now",
  backgroundColor = "bg-[#E1F5FE]",
}: FeaturedProductProps) => {
  return (
    <div className={`rounded-2xl overflow-hidden ${backgroundColor}`}>
      <div className="p-6 md:p-8">
        {badge && (
          <span className="inline-block px-3 py-1 rounded-full bg-white text-[#1976D2] text-xs font-semibold mb-4">
            {badge}
          </span>
        )}
        {isNew && (
          <span className="inline-block px-3 py-1 rounded-full bg-[#42A5F5] text-white text-xs font-semibold ml-2 mb-4">
            NEW
          </span>
        )}
        <h3 className="text-xl md:text-2xl font-bold text-[#0D47A1] mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">{description}</p>
        <div className="mb-6">
          <span className="text-2xl font-bold text-[#0D47A1]">{formatPrice(price)}</span>
        </div>
        <button className="btn-primary">
          {buttonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
      <div className="px-6 pb-6">
        <img
          src={image}
          alt={title}
          className="max-w-full h-auto object-contain mx-auto"
        />
      </div>
    </div>
  );
};

export default FeaturedProduct;
