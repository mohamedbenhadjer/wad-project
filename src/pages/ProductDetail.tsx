import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Product } from "@/types/database.types";
import { formatPrice } from "@/utils/currency";
import { Star, Heart, Share2, ShoppingCart, ArrowLeft, Check, CreditCard, Truck, Clock, ShieldCheck, PercentCircle, Copy, Check as CheckIcon } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useShop } from "@/context/ShopContext";
import { Separator } from "@/components/ui/separator";

// Define a category interface
interface Category {
  id: string;
  name: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { toast } = useToast();
  const { addToCart, removeFromCart, isInCart } = useShop();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [stockCount] = useState<number>(Math.floor(Math.random() * 50) + 5); // Random stock between 5-55
  const [discount, setDiscount] = useState<number>(0); // Initialize discount to 0
  const [deliveryDays] = useState<number>(Math.floor(Math.random() * 3) + 1); // 1-3 days delivery
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Memoize fetchProduct to prevent recreation on re-renders
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    console.log("Fetching product with id:", id);
    try {
      setLoading(true);
      
      // First try to find by numeric_id (for URL compat)
      let { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('numeric_id', id)
        .single();
      
      // If not found by numeric_id, try by id
      if (productError || !productData) {
        console.log("Product not found by numeric_id, trying by id");
        const { data: productByIdData, error: productByIdError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (productByIdError) {
          console.error('Error fetching product:', productByIdError);
          setLoading(false);
          return;
        }
        
        productData = productByIdData;
      }
      
      if (productData) {
        console.log("Product found:", productData.id);
        setProduct(productData);
        
        // Fetch related products based on category
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category', productData.category)
          .neq('id', productData.id)
          .limit(4);
        
        setRelatedProducts(relatedData || []);
      } else {
        console.log("No product data found");
      }
      
      // Fetch the categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');
        
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
      
      // Find the category name for this product
      if (productData && categoriesData) {
        const category = categoriesData.find(cat => cat.id === productData.category_id);
        setCategoryName(category ? category.name : 'Uncategorized');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Create a copy with quantity
    const productToAdd = {
      ...product,
      quantity: 1 
    };

    toast({
      title: 'Added to cart!',
      description: `${product.name} has been added to your cart.`,
    });

    addToCart(productToAdd);
    
    // Open the cart sidebar
    setCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // Add to cart first
    const productToAdd = {
      ...product,
      quantity: 1
    };
    
    addToCart(productToAdd);
    
    // Redirect to checkout page
    navigate('/checkout');
  };

  // Get the final price after discount
  const getDiscountedPrice = (price: number) => {
    if (!discount) return price;
    return price - (price * (discount / 100));
  };

  // Get technical specifications based on category
  const getTechnicalSpecs = () => {
    const baseSpecs = {
      dimensions: "160.7 x 77.6 x 7.9 mm",
      weight: "240 grams",
      madeIn: "Algeria",
      warranty: "12 months",
    };

    // Make sure categoryName is a string before trying to use toLowerCase()
    const category = categoryName ? categoryName.toLowerCase() : "";

    // Add category-specific specifications
    switch (category) {
      case "electronics":
      case "phone":
      case "smartphone":
        return {
          ...baseSpecs,
          display: "6.7 inches OLED",
          resolution: "2796 x 1290 pixels",
          battery: "4323 mAh",
          processor: "Snapdragon 8 Gen 2",
          operatingSystem: "Android 13",
          ram: "8 GB",
          storage: "128 GB / 256 GB",
          camera: "48 MP main, 12 MP ultra-wide",
        };
      case "computer":
      case "laptop":
        return {
          ...baseSpecs,
          display: "15.6 inches IPS",
          resolution: "1920 x 1080 pixels",
          processor: "Intel Core i7-12700H",
          graphics: "NVIDIA RTX 3060 6GB",
          ram: "16 GB DDR4",
          storage: "512 GB SSD",
          battery: "56 Wh",
          ports: "USB-C, HDMI, USB 3.0",
        };
      case "clothing":
      case "fashion":
        return {
          ...baseSpecs,
          material: "100% Cotton",
          style: "Casual",
          care: "Machine wash cold",
          origin: "Made in Algeria",
          fit: "Regular fit",
        };
      default:
        return baseSpecs;
    }
  };

  // Share product functionality
  const handleShareProduct = async () => {
    if (!product) return;
    
    const shareData = {
      title: product.name,
      text: `Check out this product: ${product.name}`,
      url: window.location.href,
    };
    
    // Try using the Web Share API
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Product shared with your friends",
        });
      } catch (error) {
        // User cancelled or share failed
        console.error("Error sharing:", error);
        fallbackShare();
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      fallbackShare();
    }
  };
  
  const fallbackShare = () => {
    // Copy the URL to clipboard
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Link copied to clipboard",
          description: "You can now share it manually with others",
        });
        
        // Reset the "Copied" state after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        toast({
          title: "Failed to copy link",
          description: "Please try again or copy the URL manually",
          variant: "destructive",
        });
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
          <p className="mt-4 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <p className="mb-6">We couldn't find the product you're looking for.</p>
          <Button asChild>
            <Link to="/">Back to homepage</Link>
          </Button>
        </div>
      </div>
    );
  }

  const specs = getTechnicalSpecs();
  const finalPrice = getDiscountedPrice(product.price);

  return (
    <div className="min-h-screen bg-brand-light">
      <NavBar />
      
      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Breadcrumbs */}
        <div className="mb-8 flex items-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-brand-blue">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-brand-blue">Products</Link>
          <span className="mx-2">/</span>
          <Link to={`/category/${product.category_id}`} className="hover:text-brand-blue">{categoryName}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.name}</span>
        </div>
        
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
            <Link to="/products" className="flex items-center text-gray-700 hover:text-brand-blue">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to products
            </Link>
          </Button>
        </div>
        
        {/* Product Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Left column - Image */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="object-cover w-full"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image";
                }}
              />
              {product.featured && (
                <span className="absolute top-4 left-4 bg-brand-orange text-white px-2 py-1 text-xs font-medium rounded">
                  Popular
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                  {discount}% OFF
                </span>
              )}
            </div>
          </div>
          
          {/* Right column - Content */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-4 w-4 ${star <= 4 ? "text-[#FFB831] fill-[#FFB831]" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(24 reviews)</span>
            </div>
            
            <div className="mb-6">
              {discount > 0 ? (
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-brand-dark">{formatPrice(finalPrice)}</p>
                  <p className="text-lg text-gray-500 line-through">{formatPrice(product.price)}</p>
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">Save {formatPrice(product.price - finalPrice)}</Badge>
                </div>
              ) : (
                <p className="text-3xl font-bold text-brand-dark">{formatPrice(product.price)}</p>
              )}
              
              {/* Stock Status */}
              {product.in_stock ? (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-green-700">
                    In Stock 
                    {stockCount > 0 && <span> ({stockCount} available)</span>}
                    {stockCount < 10 && <span className="text-orange-500 font-medium"> - Limited stock!</span>}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <p className="text-sm text-red-700">Out of Stock</p>
                </div>
              )}
            </div>
            
            {/* Delivery Information */}
            <div className="bg-blue-50 p-3 rounded-md mb-6 flex items-center gap-3">
              <Truck className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-700">Fast Delivery</p>
                <p className="text-xs text-blue-600">
                  Estimated delivery in {deliveryDays} {deliveryDays === 1 ? 'day' : 'days'} 
                  {categoryName?.toLowerCase() === 'electronics' && ' with installation service'}
                </p>
              </div>
            </div>
            
            <p className="mb-6 text-muted-foreground">{product.description}</p>
            
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border rounded-md">
                  <button 
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button 
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= stockCount}
                  >
                    +
                  </button>
                </div>
                
                <Button 
                  variant="outline"
                  className="flex-1 gap-2" 
                  onClick={handleAddToCart}
                  disabled={!product?.in_stock || isInCart(product?.id || '')}
                >
                  {isInCart(product?.id || '') ? (
                    <>
                      <Check className="h-4 w-4" /> Added
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" /> Add to cart
                    </>
                  )}
                </Button>
                
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                className="w-full gap-2 bg-brand-orange hover:bg-opacity-90"
                onClick={handleBuyNow}
                disabled={!product.in_stock}
              >
                <CreditCard className="h-4 w-4" /> Buy Now
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full gap-2 mt-2"
                onClick={handleShareProduct}
              >
                {isCopied ? (
                  <>
                    <CheckIcon className="h-4 w-4 text-green-500" /> Copied to clipboard!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" /> Share this product
                  </>
                )}
              </Button>
            </div>
            
            {/* Product Information */}
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Category:</span>
                <span className="text-muted-foreground capitalize">{categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Product reference:</span>
                <span className="text-muted-foreground">{product.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Made in:</span>
                <span className="text-muted-foreground">Algeria</span>
              </div>
              {categoryName?.toLowerCase() === 'electronics' && (
                <div className="flex justify-between">
                  <span className="font-medium">Warranty:</span>
                  <span className="text-muted-foreground">12 months official warranty</span>
                </div>
              )}
            </div>
            
            {/* Extra Benefits */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span>Guaranteed authentic</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-green-600" />
                <span>Return within 30 days</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-green-600" />
                <span>Free shipping over 5000 DA</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <PercentCircle className="h-4 w-4 text-green-600" />
                <span>Volume discounts</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Section */}
        <div className="mb-16">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews (24)</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="p-6 bg-white rounded-lg shadow-sm mt-3">
              <h3 className="font-bold text-lg mb-3">Product description</h3>
              <p>
                {product.description}
              </p>
              <p className="mt-4">
                The new {product.name} features our most powerful chip to date, delivering exceptional performance for all your daily needs. Its high-resolution display provides an immersive visual experience, while its long-lasting battery keeps you going all day.
              </p>
              <p className="mt-4">
                Whether you're a professional, content creator, or simply looking for a reliable and high-performance device, the {product.name} will meet all your expectations.
              </p>
              
              {/* Category specific highlights */}
              {categoryName.toLowerCase().includes('electron') && (
                <div className="mt-6">
                  <h4 className="font-semibold">Key Features:</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Premium build quality with aluminum chassis</li>
                    <li>Super fast performance for everyday tasks</li>
                    <li>High-resolution display with vibrant colors</li>
                    <li>Long battery life that lasts all day</li>
                    <li>Latest connectivity options including USB-C</li>
                    <li>Algerian warranty and local support</li>
                  </ul>
                </div>
              )}
            </TabsContent>
            <TabsContent value="specifications" className="p-6 bg-white rounded-lg shadow-sm mt-3">
              <h3 className="font-bold text-lg mb-3">Technical specifications</h3>
              <div className="space-y-4">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 border-b pb-3">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="p-6 bg-white rounded-lg shadow-sm mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Customer reviews (24)</h3>
                <Button>Write a review</Button>
              </div>
              
              <div className="space-y-6">
                {/* Sample reviews */}
                <div className="border-b pb-6">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">Ahmed B.</h4>
                    <span className="text-sm text-muted-foreground">3 days ago</span>
                  </div>
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= 5 ? "text-[#FFB831] fill-[#FFB831]" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm">Excellent product, fast delivery, and top-notch customer service! Highly recommend MC STORE.</p>
                </div>
                
                <div className="border-b pb-6">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">Samira L.</h4>
                    <span className="text-sm text-muted-foreground">1 week ago</span>
                  </div>
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= 4 ? "text-[#FFB831] fill-[#FFB831]" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm">Very satisfied with my purchase. The product perfectly matches the description.</p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">Karim M.</h4>
                    <span className="text-sm text-muted-foreground">2 weeks ago</span>
                  </div>
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= 5 ? "text-[#FFB831] fill-[#FFB831]" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm">Great shopping experience. I'm very happy with my new {product.name}. The features are impressive.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Checkout Sheet */}
      {checkoutOpen && (
        <Sheet open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <SheetContent className="sm:max-w-xl w-full">
            <SheetHeader>
              <SheetTitle>Checkout</SheetTitle>
              <SheetDescription>Complete your purchase</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-4">
                <h3 className="font-medium">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${product?.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(product?.price * 0.1).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${(product?.price * 1.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <SheetFooter>
              <Button 
                onClick={() => {
                  setCheckoutOpen(false);
                  navigate('/checkout');
                }} 
                className="w-full"
              >
                Complete Purchase
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
