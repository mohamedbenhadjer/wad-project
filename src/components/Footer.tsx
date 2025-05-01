import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  image_url: string;
}

const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">MC STORE</h3>
            <p className="text-gray-400 mb-4">
              Your one-stop shop for all your tech needs. Quality products, competitive prices, and excellent customer service.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-gray-800 rounded w-2/3 animate-pulse"></div>
                <div className="h-4 bg-gray-800 rounded w-3/5 animate-pulse"></div>
              </div>
            ) : (
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/category/${category.id}`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                {categories.length === 0 && (
                  <li className="text-gray-400">No categories found</li>
                )}
              </ul>
            )}
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/orders"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* App Download */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Download Our App</h3>
            <p className="text-gray-400 mb-4">
              Get the best shopping experience with our mobile app.
            </p>
            <div className="space-y-2">
              <a
                href="#"
                className="block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Download on the App Store
              </a>
              <a
                href="#"
                className="block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Get it on Google Play
              </a>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          <div className="flex items-center space-x-4">
            <div className="bg-white p-2 rounded-lg">
              <img
                src="/assets/images/edahabia-logo.png"
                alt="Edhahabia"
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} MC STORE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
