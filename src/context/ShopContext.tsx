import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/database.types';

type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image_url: string;
};

interface ShopContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  isInCart: (id: string) => boolean;
  isInWishlist: (id: string) => boolean;
  cartTotal: number;
  cartItemsCount: number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Helper functions to work with localStorage
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

const getFromLocalStorage = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => 
    getFromLocalStorage('cart', [])
  );
  
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => 
    getFromLocalStorage('wishlist', [])
  );
  
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);

  // Update localStorage when cart changes
  useEffect(() => {
    saveToLocalStorage('cart', cart);
    
    // Calculate cart total and item count
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    setCartTotal(total);
    setCartItemsCount(count);
  }, [cart]);

  // Update localStorage when wishlist changes
  useEffect(() => {
    saveToLocalStorage('wishlist', wishlist);
  }, [wishlist]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // If product already exists in cart, increase quantity
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Add new product to cart
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: 1
      }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const increaseQuantity = (id: string) => {
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
    ));
  };

  const decreaseQuantity = (id: string) => {
    setCart(cart.map(item => 
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    ).filter(item => item.quantity > 0));
  };

  const addToWishlist = (product: Product) => {
    if (!wishlist.some(item => item.id === product.id)) {
      setWishlist([...wishlist, {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url
      }]);
    }
  };

  const removeFromWishlist = (id: string) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  const isInCart = (id: string) => {
    return cart.some(item => item.id === id);
  };

  const isInWishlist = (id: string) => {
    return wishlist.some(item => item.id === id);
  };

  return (
    <ShopContext.Provider value={{
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      addToWishlist,
      removeFromWishlist,
      isInCart,
      isInWishlist,
      cartTotal,
      cartItemsCount
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}; 