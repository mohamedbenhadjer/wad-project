import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useShop } from '@/context/ShopContext';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { formatPrice } from '@/utils/currency';
import { Product } from '@/types/database.types';
import { Trash2, ShoppingCart } from 'lucide-react';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, addToCart } = useShop();
  const [loading] = useState(false);

  const handleRemoveFromWishlist = (id: string) => {
    removeFromWishlist(id);
  };

  const handleAddToCart = (item: { id: string; name: string; price: number; image_url: string }) => {
    // Convert to Product format for the context
    const product: Product = {
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      description: '',
      category: '',
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      numeric_id: 0,
      in_stock: true
    };
    
    addToCart(product);
    // Optionally remove from wishlist after adding to cart
    removeFromWishlist(item.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light">
        <NavBar />
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light">
      <NavBar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
        
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-gray-500 mb-6">Add items you love to your wishlist. Review them anytime and easily move them to the cart.</p>
              <Button 
                onClick={() => navigate('/products')}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white"
              >
                Browse Products
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image";
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="rounded-full h-8 w-8"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-2 line-clamp-1">{item.name}</h3>
                  <p className="text-lg font-bold text-brand-orange mb-4">{formatPrice(item.price)}</p>
                  <Button
                    className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist; 