import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/database.types";
import { formatPrice } from "@/utils/currency";
import { Star, Heart, ShoppingCart, ArrowRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  name: string;
  image_url: string;
}

const Category = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [relatedCategories, setRelatedCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', categoryId)
          .single();
        
        if (categoryError) throw categoryError;
        setCategory(categoryData);
        
        // Fetch products for this category
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', categoryId)
          .order('created_at', { ascending: false });
        
        if (productsError) throw productsError;
        setProducts(productsData || []);
        
        // Fetch related categories (excluding current category)
        const { data: relatedCategoriesData, error: relatedCategoriesError } = await supabase
          .from('categories')
          .select('*')
          .neq('id', categoryId)
          .limit(4);
        
        if (relatedCategoriesError) throw relatedCategoriesError;
        setRelatedCategories(relatedCategoriesData || []);
        
      } catch (error) {
        console.error("Error fetching category data:", error);
        toast({
          title: "Error",
          description: "Failed to load category data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryAndProducts();
    }
  }, [categoryId, toast]);

  return (
    <div className="min-h-screen bg-brand-light">
      <NavBar />
      
      {/* Category Header */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-brand-dark">
                {category?.name || "Category"}
              </h1>
              <p className="text-gray-500 mt-2">
                {products.length} products available
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white">
                <Heart className="h-4 w-4 mr-2" />
                Save Category
              </Button>
              <Button variant="outline" className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Cart
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Loading State */}
      {loading ? (
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mb-4"></div>
            <p className="text-lg text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={(product.numeric_id || product.id).toString()}
                    title={product.name}
                    price={product.price}
                    image={product.image_url}
                    rating={4.5}
                    reviewCount={105}
                  />
                ))}
              </div>
              
              {/* Empty State */}
              {products.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6">We couldn't find any products in this category.</p>
                  <Button asChild>
                    <Link to="/">Return to Home</Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
          
          {/* Related Categories */}
          {relatedCategories.length > 0 && (
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-brand-dark mb-8">You might also like</h2>
                <div className="flex overflow-x-auto pb-6 scrollbar-hide no-scrollbar">
                  <div className="flex space-x-4 px-2">
                    {relatedCategories.map((relatedCategory) => (
                      <div key={relatedCategory.id} className="shrink-0 w-40 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <Link to={`/category/${relatedCategory.id}`} className="block">
                          <div className="aspect-square bg-[#f8f8f8] overflow-hidden">
                            <img 
                              src={relatedCategory.image_url} 
                              alt={relatedCategory.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3 text-center">
                            <h3 className="font-medium text-gray-800 text-sm">{relatedCategory.name}</h3>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}
      
      <Footer />
    </div>
  );
};

export default Category; 