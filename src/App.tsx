import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "./integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { ShopProvider } from "./context/ShopContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import UpdatePassword from "./pages/UpdatePassword";
import ResetPasswordError from "./pages/ResetPasswordError";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Category from "./pages/Category";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import DashboardLayout from "@/components/DashboardLayout";
import Products from "@/pages/Products";
import Categories from "@/pages/Categories";

// Define types for our contexts
export type AuthContextType = {
  user: User | null;
  session: any | null;
  loading: boolean;
};

export type SupabaseContextType = typeof supabase;

// Create a context for Supabase and authentication state
export const SupabaseContext = createContext<SupabaseContextType | null>(null);
export const AuthContext = createContext<AuthContextType | null>(null);

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed, event:", _event, "session:", session ? "exists" : "null");
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseContext.Provider value={supabase}>
        <AuthContext.Provider value={{ user, session, loading }}>
          <ShopProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/update-password" element={<UpdatePassword />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/reset-password" element={<UpdatePassword />} />
                  <Route path="/auth/reset-password" element={<UpdatePassword />} />
                  <Route path="/reset-password-error" element={<ResetPasswordError />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/category/:categoryId" element={<Category />} />
                  
                  {/* Dashboard Routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/profile" element={<Profile />} />
                  <Route path="/dashboard/orders" element={<Orders />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  
                  {/* Catch all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </TooltipProvider>
          </ShopProvider>
        </AuthContext.Provider>
      </SupabaseContext.Provider>
    </QueryClientProvider>
  );
};

export default App;