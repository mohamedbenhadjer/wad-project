import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  LayoutDashboard,
  LogOut,
  Heart,
} from "lucide-react";
import { AuthContext } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/context/ShopContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading } = useContext(AuthContext);
  const { cartItemsCount, wishlist } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current path is the products page
  const isProductsPage = location.pathname === '/products';

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear the search input after submission
      setIsMenuOpen(false); // Close the mobile menu if open
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="font-bold text-xl flex items-center space-x-2">
              <span className="text-brand-orange">MC STORE</span>
            </Link>
          </div>

          {/* Search Bar - Hidden on Mobile and shown only on products page */}
          {isProductsPage && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="search-input bg-gray-50 pl-10 pr-4 py-2 w-full border rounded-md"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button 
                  type="submit" 
                  className="absolute left-3 top-2.5 text-gray-400 hover:text-brand-orange"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-brand-orange">
              Home
            </Link>
            <Link
              to="/products"
              className="text-sm font-medium hover:text-brand-orange"
            >
              Products
            </Link>
            <Link
              to="/categories"
              className="text-sm font-medium hover:text-brand-orange"
            >
              Categories
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium hover:text-brand-orange"
            >
              Contact
            </Link>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center cursor-pointer w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="flex items-center cursor-pointer w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/orders" className="flex items-center cursor-pointer w-full">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/auth"
                className="text-sm font-medium hover:text-brand-orange flex items-center"
              >
                <User className="h-5 w-5 mr-1" />
                <span>Login</span>
              </Link>
            )}

            <Link
              to="/wishlist"
              className="text-sm font-medium hover:text-brand-orange relative"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="text-sm font-medium hover:text-brand-orange relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-orange text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link
              to="/wishlist"
              className="text-sm font-medium hover:text-brand-orange relative"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {wishlist.length}
                </span>
              )}
            </Link>
            
            <Link
              to="/cart"
              className="text-sm font-medium hover:text-brand-orange relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-orange text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <button onClick={toggleMenu} className="focus:outline-none">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Only on products page */}
        {isProductsPage && (
          <div className="mt-3 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="search-input bg-gray-50 pl-10 pr-4 py-2 w-full border rounded-md"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button 
                type="submit" 
                className="absolute left-3 top-2.5 text-gray-400 hover:text-brand-orange"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 border-t pt-3">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-sm font-medium py-2 hover:text-brand-orange"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-sm font-medium py-2 hover:text-brand-orange"
                onClick={toggleMenu}
              >
                Products
              </Link>
              <Link
                to="/categories"
                className="text-sm font-medium py-2 hover:text-brand-orange"
                onClick={toggleMenu}
              >
                Categories
              </Link>
              <Link
                to="/contact"
                className="text-sm font-medium py-2 hover:text-brand-orange"
                onClick={toggleMenu}
              >
                Contact
              </Link>
              {!loading && !user && (
                <Link
                  to="/auth"
                  className="text-sm font-medium py-2 hover:text-brand-orange flex items-center"
                  onClick={toggleMenu}
                >
                  <User className="h-5 w-5 mr-2" />
                  <span>Login</span>
                </Link>
              )}
              {!loading && user && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium py-2 hover:text-brand-orange flex items-center"
                    onClick={toggleMenu}
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/dashboard/profile"
                    className="text-sm font-medium py-2 hover:text-brand-orange flex items-center"
                    onClick={toggleMenu}
                  >
                    <User className="h-5 w-5 mr-2" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/dashboard/orders"
                    className="text-sm font-medium py-2 hover:text-brand-orange flex items-center"
                    onClick={toggleMenu}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    <span>My Orders</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="text-sm font-medium py-2 hover:text-brand-orange flex items-center"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
