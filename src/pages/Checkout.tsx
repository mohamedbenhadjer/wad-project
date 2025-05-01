import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useShop } from '@/context/ShopContext';
import { formatPrice } from '@/utils/currency';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from '@/App';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface EdahabiaInfo {
  cardNumber: string;
  expiryDate: string;
  securityCode: string;
}

// Algeria provinces/wilayas - all 58 provinces
const ALGERIA_PROVINCES = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'El M\'Ghair', 'El Meniaa', 'Ouled Djellal', 'Bordj Badji Mokhtar',
  'Béni Abbès', 'Timimoun', 'Touggourt', 'Djanet', 'In Salah', 'In Guezzam'
];

// Major cities in Algeria
const ALGERIA_CITIES = [
  'Alger (Algiers)', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Sétif', 
  'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'Tlemcen', 'Béjaïa', 'Tiaret', 'Bordj Bou Arréridj',
  'Tizi Ouzou', 'Skikda', 'Chlef', 'Ouargla', 'Béchar', 'Mostaganem', 'M\'Sila', 'Tindouf',
  'Jijel', 'El Oued', 'Touggourt', 'Ghardaïa', 'Laghouat', 'Relizane', 'Médéa', 'Saïda',
  'Guelma', 'Khenchela', 'Boumerdès', 'Tamanrasset', 'Béni Abbès', 'Djanet', 'In Salah'
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, removeFromCart } = useShop();
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Algeria', // Set Algeria as default
  });
  const [paymentMethod, setPaymentMethod] = useState('edhahabia');
  const [edahabiaInfo, setEdahabiaInfo] = useState<EdahabiaInfo>({
    cardNumber: '',
    expiryDate: '',
    securityCode: ''
  });
  const [processing, setProcessing] = useState(false);

  // Fetch user profile info when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user profile from database
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
        } else if (profileData) {
          // Initialize with empty values
          let address = '';
          let city = '';
          let state = '';
          let zipCode = '';
          let country = 'Algeria'; // Set Algeria as default
          
          // Try to parse the full address if it exists
          if (profileData.address) {
            const addressParts = profileData.address.split(', ');
            
            // Different parsing strategies based on number of parts
            if (addressParts.length >= 5) {
              // Full address format: address, city, state, zip, country
              address = addressParts[0] || '';
              city = addressParts[1] || '';
              state = addressParts[2] || '';
              zipCode = addressParts[3] || '';
              // Keep Algeria as default even if country is specified
              if (addressParts[4]) country = addressParts[4];
            } else if (addressParts.length === 4) {
              // Shortened format: address, city, state, country
              address = addressParts[0] || '';
              city = addressParts[1] || '';
              state = addressParts[2] || '';
              if (addressParts[3]) country = addressParts[3];
            } else if (addressParts.length === 3) {
              // Minimal format: address, city, country
              address = addressParts[0] || '';
              city = addressParts[1] || '';
              if (addressParts[2]) country = addressParts[2];
            } else if (addressParts.length > 0) {
              // Just use the first part as address
              address = addressParts[0] || '';
            }
          }
          
          // Update shipping info with profile data
          setShippingInfo({
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            email: user.email || '',
            address: address,
            city,
            state,
            zipCode,
            country,
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEdahabiaInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your purchase",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      // Format all shipping information into a single address string
      const formattedAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}, ${shippingInfo.zipCode}, ${shippingInfo.country}`;
      
      // Create order in Supabase with simplified schema
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          total_amount: cartTotal,
          shipping_address: formattedAddress,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items for each product in the cart - one by one to handle RLS issues
      for (const item of cart) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: orderData.id,
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
          });
        
        if (itemError) {
          console.error(`Error adding item ${item.id} to order:`, itemError);
          // Continue with other items even if one fails
        }
      }
      
      // Update user profile with shipping information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: shippingInfo.firstName,
          last_name: shippingInfo.lastName,
          address: formattedAddress,
        })
        .eq('id', user.id);
        
      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Don't throw here, still consider the order successful
      }
      
      // Clear cart after successful order
      cart.forEach(item => {
        removeFromCart(item.id);
      });
      
      // Show success message
      toast({
        title: "Order Placed Successfully",
        description: "Thank you for your order! You will receive a confirmation email shortly.",
      });
      
      // Redirect to a thank you page
      navigate('/');
    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        title: "Order Processing Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
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

  // If cart is empty, redirect to cart page
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-brand-light">
        <NavBar />
        <div className="container mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">You need to add items to your cart before checkout.</p>
              <Button 
                onClick={() => navigate('/products')}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white"
              >
                Browse Products
              </Button>
            </div>
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
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Select
                      value={shippingInfo.city}
                      onValueChange={(value) => handleSelectChange('city', value)}
                    >
                      <SelectTrigger id="city">
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALGERIA_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="state">Province (Wilaya)</Label>
                    <Select
                      value={shippingInfo.state}
                      onValueChange={(value) => handleSelectChange('state', value)}
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select a province" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALGERIA_PROVINCES.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">Postal Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleInputChange}
                      required
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="edhahabia" id="edhahabia" className="text-brand-orange" />
                    <Label htmlFor="edhahabia" className="flex items-center">
                      <span className="ml-2">Edahabia Card</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" className="text-brand-orange" />
                    <Label htmlFor="cash">Cash on Delivery</Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'edhahabia' && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={edahabiaInfo.cardNumber}
                        onChange={handlePaymentInputChange}
                        placeholder="1234 5678 9012 3456"
                        required={paymentMethod === 'edhahabia'}
                        className="focus-visible:ring-brand-orange"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          value={edahabiaInfo.expiryDate}
                          onChange={handlePaymentInputChange}
                          placeholder="MM/YY"
                          required={paymentMethod === 'edhahabia'}
                          className="focus-visible:ring-brand-orange"
                        />
                      </div>
                      <div>
                        <Label htmlFor="securityCode">CVC</Label>
                        <Input
                          id="securityCode"
                          name="securityCode"
                          value={edahabiaInfo.securityCode}
                          onChange={handlePaymentInputChange}
                          placeholder="123"
                          required={paymentMethod === 'edhahabia'}
                          className="focus-visible:ring-brand-orange"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Items ({cart.length})</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center border-b pb-2">
                          <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image";
                              }}
                            />
                          </div>
                          <div className="ml-2 flex-grow">
                            <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                            <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                          </div>
                          <div className="text-sm font-medium text-brand-orange">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-brand-orange">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-brand-orange">{formatPrice(cartTotal)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white"
                    disabled={processing}
                  >
                    {processing ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout; 