import { ArrowRight } from "lucide-react";

interface DiscountBannerProps {
  title: string;
  subtitle: string;
  discount: string;
  image: string;
  backgroundColor?: string;
  buttonText?: string;
}

const DiscountBanner = ({
  title,
  subtitle,
  discount,
  image,
  backgroundColor = "bg-[#E1F5FE]",
  buttonText = "Shop Now",
}: DiscountBannerProps) => {
  return (
    <div className={`flex flex-col lg:flex-row ${backgroundColor} rounded-2xl overflow-hidden`}>
      <div className="relative p-8 lg:p-12 flex-1">
        <span className="text-[#1976D2] font-bold text-5xl mb-2 block">{discount}</span>
        <h3 className="text-2xl lg:text-3xl font-bold text-[#0D47A1] mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{subtitle}</p>
        <button className="btn-primary inline-flex items-center">
          {buttonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
      <div className="w-full lg:w-1/3 flex items-center justify-center relative py-6">
        <img
          src={image}
          alt={title}
          className="max-w-full h-auto max-h-64 object-contain"
        />
      </div>
    </div>
  );
};

export default DiscountBanner;
