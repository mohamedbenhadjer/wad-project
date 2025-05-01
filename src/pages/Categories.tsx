import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  product_count: number;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select(`
            *,
            products:products(count)
          `);

        if (error) throw error;

        // Transform the data to include product count
        const transformedCategories = data.map(category => ({
          ...category,
          product_count: category.products[0].count
        }));

        setCategories(transformedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Error loading categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light">
        <NavBar />
        <div className="container mx-auto p-4">Loading...</div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-brand-light">
      <NavBar />
      
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Categories</h1>
        
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found.</p>
            <Link
              to="/"
              className="mt-4 text-brand-blue hover:text-brand-blue-dark"
            >
              Return to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link to={`/category/${category.id}`} key={category.id}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-2">{category.name}</CardTitle>
                    <p className="text-gray-600 mb-2">{category.description}</p>
                    <p className="text-sm text-gray-500">{category.product_count} products</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Categories; 