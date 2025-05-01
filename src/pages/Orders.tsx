import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "@/App";
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
import { Eye } from "lucide-react";
import { Order, OrderItem, Product } from "@/types/database.types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface OrderWithItems extends Order {
  items?: (OrderItem & {
    product?: Product;
  })[];
}

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching orders for user:", user.id);
        
        // Fetch real orders from Supabase
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Supabase error fetching orders:", error);
          throw error;
        }
        
        console.log("Orders received:", data);
        setOrders(data || []);
      } catch (error) {
        console.error("Error loading orders:", error);
        toast({
          title: "Error",
          description: "Unable to load your orders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, toast]);

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

  // Let's add a helper function in case we need to parse the address
  const parseShippingAddress = (fullAddress: string) => {
    // This is a simple parser that assumes the address format we created in Checkout
    // Format: address, city, state, zipCode, country
    const parts = fullAddress.split(', ');
    
    // Handle cases where address might not have all parts
    if (parts.length >= 5) {
      return {
        address: parts[0],
        city: parts[1],
        state: parts[2],
        zipCode: parts[3],
        country: parts[4],
      };
    }
    
    // Return the full address as the address if we can't parse it
    return {
      address: fullAddress,
      city: '',
      state: '',
      zipCode: '',
      country: '',
    };
  };

  const handleViewOrder = async (order: Order) => {
    try {
      // Fetch order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*, product:product_id(*)')
        .eq('order_id', order.id);
      
      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
        throw itemsError;
      }
      
      // Set the selected order with items
      setSelectedOrder({
        ...order,
        items: orderItems || []
      });
      
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error viewing order details:", error);
      toast({
        title: "Error",
        description: "Unable to load order details",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">My Orders</h1>
          <p className="text-muted-foreground">
            History of all your orders
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <p>Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
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
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
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
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-12 border rounded-md">
            <h3 className="text-lg font-medium mb-2">
              No orders found
            </h3>
            <p className="text-muted-foreground">
              You haven't placed any orders on MC STORE yet.
            </p>
            <Button className="mt-4" asChild>
              <a href="/">Start shopping</a>
            </Button>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Order Information</h3>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Order ID:</span>{" "}
                    {selectedOrder.id}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Date:</span>{" "}
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Shipping Information</h3>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Address:</span>{" "}
                    {selectedOrder.shipping_address}
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
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.product?.name || "Unknown Product"}
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No items found for this order.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <span className="font-medium">Order Total:</span>
                <span className="text-xl font-bold text-brand-orange">
                  {formatPrice(selectedOrder.total_amount)}
                </span>
              </div>
              
              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Orders;
