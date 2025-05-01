import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types/database.types";
import { formatPrice } from "@/utils/currency";
import { Star, Heart, ShoppingCart, ArrowRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define types for our dynamic content
interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image_url: string;
}

interface PromotionalBanner {
  id: string;
  title: string;
  subtitle: string;
  discount?: string;
  image_url: string;
}

interface Category {
  id: string;
  name: string;
  image_url: string;
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestDeals, setBestDeals] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProductCounts, setCategoryProductCounts] = useState<Record<string, number>>({});
  const [promotionalBanner, setPromotionalBanner] = useState<PromotionalBanner | null>(null);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch MacBook M3 Pro for hero section
        const { data: macbookData, error: macbookError } = await supabase
          .from('products')
          .select('*')
          .ilike('name', '%MacBook Pro M3%')
          .limit(1)
          .maybeSingle();
        
        if (macbookError && macbookError.code !== 'PGRST116') {
          console.error("Error fetching MacBook Pro M3:", macbookError);
          toast({
            title: "Error",
            description: "Failed to load hero product",
            variant: "destructive",
          });
        } else {
          setHeroProduct(macbookData);
        }

        // Fetch featured products
        const { data: featuredData, error: featuredError } = await supabase
          .from('products')
          .select('*')
          .eq('featured', true)
          .limit(12);
        
        if (featuredError) throw featuredError;
        setFeaturedProducts(featuredData || []);
        
        // Fetch best deals (lowest price products)
        const { data: dealsData, error: dealsError } = await supabase
          .from('products')
          .select('*')
          .order('price', { ascending: true })
          .limit(4);
        
        if (dealsError) throw dealsError;
        setBestDeals(dealsData || []);
        
        // Fetch accessories (products with "magic" in name)
        const { data: accessoriesData, error: accessoriesError } = await supabase
          .from('products')
          .select('*')
          .ilike('name', '%magic%')
          .limit(4);
        
        if (accessoriesError) throw accessoriesError;
        setAccessories(accessoriesData || []);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
        
        // Fetch product counts for each category
        const counts: Record<string, number> = {};
        
        // Use Promise.all to fetch all counts in parallel
        await Promise.all(
          (categoriesData || []).map(async (category) => {
            const { count, error: countError } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', category.id);
            
            if (countError) {
              console.error(`Error fetching count for category ${category.id}:`, countError);
              counts[category.id] = 0;
            } else {
              counts[category.id] = count || 0;
            }
          })
        );
        
        setCategoryProductCounts(counts);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load some data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
          <p className="mt-4 text-lg">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light">
      <NavBar />
      <Hero product={heroProduct || undefined} />
      
      {/* Best Deals Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-brand-dark">Best Deals</h2>
            <Button variant="ghost" className="text-brand-orange hover:text-brand-orange/80 hover:bg-brand-light group" asChild>
              <Link to="/products" className="flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestDeals.map((product) => (
              <ProductCard
                key={product.id}
                id={(product.numeric_id || product.id).toString()}
                title={product.name}
                price={product.price}
                image={product.image_url}
                rating={Math.floor(Math.random() * 5) + 3}
                reviewCount={Math.floor(Math.random() * 200) + 50}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 relative">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Categories</h2>
          
          <div className="flex overflow-x-auto scrollbar-hide no-scrollbar pb-6">
            <div className="flex space-x-5 md:space-x-6 px-4">
              
              {categories.map((category) => (
                <div key={category.id} className="shrink-0 w-56 bg-white rounded-lg overflow-hidden shadow-sm">
                  <Link to={`/category/${category.id}`} className="block">
                    <div className="aspect-square bg-[#f8f8f8] overflow-hidden">
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-medium text-gray-800">{category.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{categoryProductCounts[category.id] || 0} items</p>
                    </div>
                  </Link>
                </div>
              ))}
              
              {/* If no categories are fetched, show placeholder */}
              {categories.length === 0 && (
                <div className="shrink-0 w-56 bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-400">No categories found</p>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-medium text-gray-800">No categories</h3>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-brand-dark">Featured Products</h2>
            <Button variant="ghost" className="text-brand-orange hover:text-brand-orange/80 hover:bg-brand-light group" asChild>
              <Link to="/products" className="flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                id={(product.numeric_id || product.id).toString()}
                title={product.name}
                price={product.price}
                image={product.image_url}
                rating={Math.floor(Math.random() * 5) + 3}
                reviewCount={Math.floor(Math.random() * 200) + 50}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* MacBook Promotional Banner */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-[#FFF9E7] rounded-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center">
              <div className="p-6 md:p-8 md:w-1/2">
                <h3 className="text-3xl md:text-4xl font-bold mb-2 text-brand-orange">20% DISCOUNT</h3>
                <h4 className="text-2xl font-bold mb-2 text-brand-dark">Macbook Pro</h4>
                <p className="text-gray-500 text-base mb-4">M1 Max Chip, 14-inch or 16-inch display, 32GB RAM</p>
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white" asChild>
                  <Link to={`/product/${heroProduct?.numeric_id || heroProduct?.id}`} className="flex items-center gap-2">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="md:w-1/2 p-4">
                <div className="max-h-60 flex items-center justify-center">
                  <img 
                    src={heroProduct?.image_url} 
                    alt="MacBook Pro"
                    className="w-auto h-auto max-h-full object-contain rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Accessories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-brand-dark">Accessories</h2>
            <Button variant="ghost" className="text-brand-orange hover:text-brand-orange/80 hover:bg-brand-light group" asChild>
              <Link to="/products" className="flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {accessories.map((product) => (
            <ProductCard 
                key={product.id}
                id={(product.numeric_id || product.id).toString()}
                title={product.name}
                price={product.price}
                image={product.image_url}
                rating={Math.floor(Math.random() * 5) + 3}
                reviewCount={Math.floor(Math.random() * 200) + 50}
            />
            ))}
          </div>
        </div>
      </section>
      
      {/* Promotional Banner */}
      {promotionalBanner && (
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-[#0D47A1] to-[#1976D2] rounded-2xl overflow-hidden">
              <div className="flex flex-col md:flex-row items-center">
                <div className="p-8 md:p-12 text-white md:w-1/2">
                  <h3 className="text-xl font-bold mb-2">{promotionalBanner.title}</h3>
                  <p className="text-lg mb-6">{promotionalBanner.subtitle}</p>
                  {promotionalBanner.discount && (
                    <div className="inline-block bg-white text-[#0D47A1] px-4 py-2 rounded-full font-bold mb-6">
                      {promotionalBanner.discount}
                    </div>
                  )}
                  <Button size="lg" className="bg-white text-[#0D47A1] hover:bg-[#E1F5FE]" asChild>
                    <Link to="/products">Shop Now</Link>
                  </Button>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src={promotionalBanner.image_url} 
                    alt={promotionalBanner.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Latest News Section */}
      {newsArticles.length > 0 && (
        <section className="py-16 bg-[#E1F5FE]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center text-[#0D47A1]">Latest News</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {newsArticles.map((article) => (
                <div key={article.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={article.image_url || '/placeholder.jpg'} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(article.date).toLocaleDateString()} • {article.author}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-[#1976D2]">{article.title}</h3>
                    <p className="text-gray-600 mb-4">{article.excerpt}</p>
                    <Button variant="ghost" size="sm" className="text-[#1976D2] hover:text-[#0D47A1] group">
                      <span className="flex items-center gap-2">
                        Read More
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Newsletter Section */}
      <section className="py-16 bg-[#0D47A1] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="mb-6">Stay updated with our latest products, offers, and tech news.</p>
            
            <form className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-4 py-3 rounded-lg text-black focus:outline-none"
                required
              />
              <Button type="submit" className="bg-[#42A5F5] hover:bg-[#1976D2] text-white">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
