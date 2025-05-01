import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database.types';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { X } from 'lucide-react';

const placeholderImage = "https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image";

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const productsPerPage = 24;
  const { toast } = useToast();

  // Extract search query from URL on component mount and URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('search') || '';
    setSearchQuery(query);
    setPage(1); // Reset to first page when search changes from URL
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        
        // Build query for counting
        let countQuery = supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
          
        // Add search filter if there's a search query
        if (searchQuery) {
          countQuery = countQuery.ilike('name', `%${searchQuery}%`);
        }
        
        // Get total count of products matching search
        const { count, error: countError } = await countQuery;
          
        if (countError) throw countError;
        setTotalProducts(count || 0);
        
        // Build query for fetching
        let query = supabase
          .from('products')
          .select('*')
          .order(sortBy, { ascending: sortOrder === 'asc' });
          
        // Add search filter if there's a search query
        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }
        
        // Add pagination
        query = query.range((page - 1) * productsPerPage, page * productsPerPage - 1);
          
        // Execute the query
        const { data, error } = await query;

        if (error) throw error;
        
        console.log('Fetched products:', data?.length, data);
        
        // Ensure each product has required fields
        const validatedProducts = data?.map(product => ({
          ...product,
          name: product.name || "Unnamed Product",
          price: product.price || 0,
          image_url: product.image_url || placeholderImage,
          description: product.description || "No description available"
        })) || [];
        
        console.log('Validated products:', validatedProducts.length);
        
        if (page === 1) {
          setProducts(validatedProducts);
        } else {
          setProducts(prevProducts => [...prevProducts, ...validatedProducts]);
        }
        
        setHasMore((page * productsPerPage) < (count || 0));
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Error loading products');
        toast({
          title: "Error",
          description: "Failed to load products. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchProducts();
  }, [sortBy, sortOrder, page, searchQuery, toast]);

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setPage(1); // Reset to first page when sorting changes
  };

  const handleOrderChange = (newOrder: string) => {
    setSortOrder(newOrder);
    setPage(1); // Reset to first page when order changes
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    navigate('/products');
    setPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-brand-light">
        <NavBar />
        <div className="container mx-auto p-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const productCardData = products.map(product => ({
    id: product.id,
    title: product.name || "Unnamed Product",
    price: product.price || 0,
    image: product.image_url || placeholderImage,
    rating: 0,
    reviewCount: 0,
    description: product.description || "No description available",
    badge: undefined,
    discount: undefined
  }));

  console.log('Product card data:', productCardData.length, productCardData);

  return (
    <div className="min-h-screen bg-brand-light">
      <NavBar />
      
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Products</h1>
          {searchQuery && (
            <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2">
              <span>
                Showing results for: <span className="font-medium">{searchQuery}</span>
              </span>
              <Button 
                onClick={clearSearch}
                variant="ghost" 
                size="sm"
                className="text-red-500 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Sorting options */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="sortBy" className="text-sm font-medium">Sort by:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="p-2 border rounded bg-white"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="created_at">Date Added</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="sortOrder" className="text-sm font-medium">Order:</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="p-2 border rounded bg-white"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          
          <div className="ml-auto text-sm text-gray-500">
            Showing {products.length} of {totalProducts} products
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery 
                ? `No products matching "${searchQuery}" found.` 
                : "No products found."}
            </p>
            {searchQuery && (
              <Button 
                onClick={clearSearch}
                variant="outline" 
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Products grid */}
            <section className="py-6">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {productCardData.map((product, index) => (
                  <ProductCard
                    key={product.id || index}
                    {...product}
                  />
                ))}
              </div>
            </section>
            
            {loadingMore && (
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={`loading-${i}`} className="bg-white rounded-lg overflow-hidden shadow-sm">
                    <Skeleton className="h-32 md:h-48 w-full" />
                    <div className="p-2 md:p-4">
                      <Skeleton className="h-4 md:h-6 w-3/4 mb-2" />
                      <Skeleton className="h-3 md:h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {hasMore && !loadingMore && (
              <div className="mt-8 text-center">
                <Button 
                  onClick={handleLoadMore} 
                  disabled={loadingMore}
                  className="bg-brand-blue hover:bg-brand-blue/90 text-white"
                >
                  Load More Products
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Products; 