import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "@/App";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { formatPrice } from "@/utils/currency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { Order, OrderItem, Product } from "@/types/database.types";
import { supabase } from "@/integrations/supabase/client";

interface ExtendedOrder extends Omit<Order, 'shipping_address'> {
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  total_amount: number;
  order_items: (OrderItem & {
    products: Product;
  })[];
}

const AdminOrders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        // Show access denied page instead of redirecting to auth
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check for admin role in the user's profile
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned"
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        // Check if user has admin role
        if (profileData && profileData.is_admin === true) {
          console.log("User is admin, proceeding to load admin page");
          setIsAdmin(true);
          fetchOrders();
        } else {
          // User doesn't have admin role
          console.log("User is not admin - no admin permission");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Exception during admin check:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      // First, fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (ordersError) {
        throw ordersError;
      }
      
      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }
      
      // Fetch order items with their products
      const enhancedOrders = await Promise.all(
        ordersData.map(async (order) => {
          // Get order items with products
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('*, products:product_id(*)')
            .eq('order_id', order.id);
            
          // Get profile information for the user
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', order.user_id)
            .single();
            
          return {
            ...order,
            profiles: profileData || { first_name: null, last_name: null, email: null },
            order_items: orderItems || []
          } as ExtendedOrder;
        })
      );
      
      setOrders(enhancedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Unable to load orders from database",
        variant: "destructive",
      });
    }
  };

  const handleViewOrder = (order: ExtendedOrder) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      // Update order status in Supabase
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
      if (error) {
        throw error;
      }
      
      // Update order in local state
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      );
      
      setOrders(updatedOrders);
      
      // Update selected order if in dialog
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus
        });
      }

      toast({
        title: "Status updated",
        description: `Order has been updated to "${newStatus}"`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Unable to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

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

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-red-500 font-semibold mb-2">Access Denied</p>
          <p>You don't have permission to access admin pages</p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    ); 
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {order.profiles?.first_name
                      ? `${order.profiles.first_name} ${order.profiles.last_name || ""}`
                      : "Unknown user"}
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={order.status}
                      onValueChange={(value) =>
                        handleUpdateStatus(order.id, value)
                      }
                    >
                      <SelectTrigger
                        className={`w-32 h-8 text-xs ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        <SelectValue placeholder={order.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(order.total_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">
                      No orders found.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Order Information</h3>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Number:</span>{" "}
                    {selectedOrder.id}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Date:</span>{" "}
                    {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Total:</span>{" "}
                    {formatPrice(selectedOrder.total_amount)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Customer Information</h3>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Name:</span>{" "}
                    {selectedOrder.profiles?.first_name}{" "}
                    {selectedOrder.profiles?.last_name}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">ID:</span>{" "}
                    {selectedOrder.user_id}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.order_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.products?.name || "Unknown Product"}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(item.price)}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
                <Select
                  defaultValue={selectedOrder.status}
                  onValueChange={(value) =>
                    handleUpdateStatus(selectedOrder.id, value)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminOrders;
