
import { Calendar, ArrowRight } from "lucide-react";

interface NewsCardProps {
  title: string;
  excerpt: string;
  date: string;
  image: string;
  author: string;
  link?: string;
}

const NewsCard = ({
  title,
  excerpt,
  date,
  image,
  author,
  link = "#",
}: NewsCardProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{date}</span>
          <span className="mx-2">•</span>
          <span>By {author}</span>
        </div>
        <h3 className="font-semibold text-lg text-brand-dark mb-2 line-clamp-2 hover:text-brand-blue transition-colors">
          <a href={link}>{title}</a>
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {excerpt}
        </p>
        <a
          href={link}
          className="text-brand-blue text-sm font-medium inline-flex items-center hover:underline"
        >
          Read More
          <ArrowRight className="ml-1 h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default NewsCard;
