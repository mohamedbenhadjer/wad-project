import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "@/App";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, UserCheck } from "lucide-react";
import { formatPrice } from "@/utils/currency";
import { Profile } from "@/types/database.types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

type OrderSummary = {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch user profile from Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive",
          });
        } else {
          setProfile(profileData);
        }

        // Fetch orders from Supabase
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id);

        if (ordersError) {
          console.error("Error fetching orders:", ordersError);
          toast({
            title: "Error",
            description: "Failed to load order data",
            variant: "destructive",
          });
        } else {
          setOrderCount(ordersData?.length || 0);
          
          // Get recent orders for display
          const recentOrdersData = ordersData
            ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
            .map(order => ({
              id: order.id,
              total_amount: order.total_amount,
              status: order.status,
              created_at: order.created_at
            })) || [];
          
          setRecentOrders(recentOrdersData);
        }
        
        // Fetch wishlist count from Supabase
        const { count: wishlistCountData, error: wishlistError } = await supabase
          .from('wishlist')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (wishlistError) {
          console.error("Error fetching wishlist count:", wishlistError);
        } else {
          setWishlistCount(wishlistCountData || 0);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1976D2]"></div>
          <p className="ml-2">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name || "User"}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Tracked Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wishlistCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Account Status
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          {recentOrders.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-4 bg-muted p-4 font-medium">
                <div>ID</div>
                <div>Date</div>
                <div>Status</div>
                <div className="text-right">Total</div>
              </div>
              <div className="divide-y">
                {recentOrders.map((order) => (
                  <div key={order.id} className="grid grid-cols-4 p-4">
                    <div className="truncate">{order.id.slice(0, 8)}...</div>
                    <div>
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-right">{formatPrice(order.total_amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-6 border rounded-md">
              <p className="text-muted-foreground">
                You have no orders yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
