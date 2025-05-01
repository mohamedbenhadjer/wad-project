import { ArrowRight } from "lucide-react";

interface PromoBannerProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badge?: string;
  buttonText?: string;
  backgroundColor?: string;
  textColor?: string;
}

const PromoBanner = ({
  title,
  subtitle,
  description,
  image,
  badge = "NEW RELEASE",
  buttonText = "Shop Now",
  backgroundColor = "bg-[#0D47A1]",
  textColor = "text-white",
}: PromoBannerProps) => {
  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm ${backgroundColor} ${textColor}`}>
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10">
          {badge && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-4">
              {badge}
            </span>
          )}
          <h3 className="text-2xl md:text-3xl font-bold mb-2">{title}</h3>
          <p className="text-lg md:text-xl font-medium opacity-90 mb-2">{subtitle}</p>
          <p className="opacity-80 mb-6 text-sm">{description}</p>
          <button className="btn-hover-effect bg-white text-[#0D47A1] font-medium px-6 py-2.5 rounded-md inline-flex items-center transition-all hover:bg-[#E1F5FE]">
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-8">
          <img
            src={image}
            alt={title}
            className="max-w-full h-auto object-contain max-h-72"
          />
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
