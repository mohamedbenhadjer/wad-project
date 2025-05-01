import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/App";
import { useContext } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  ShoppingBag,
  Home,
  User,
  Package,
  LogOut,
  ShoppingCart,
  Users,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "@/utils/auth";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      // First, show feedback that logout is in progress
      toast({
        title: "Logging out",
        description: "Please wait...",
      });
      
      const success = await signOut();
      
      if (!success) {
        toast({
          title: "Logout issue",
          description: "There was a problem with the server, but we're logging you out anyway.",
        });
      }
      
      // Always force reload the page to ensure all state is cleared,
      // even if there was an error with the server
      window.location.href = '/';
      
    } catch (error) {
      console.error("Exception during logout:", error);
      toast({
        title: "Error",
        description: "An error occurred, but we'll try to log you out anyway.",
      });
      
      // Still try to redirect even if there was an error
      window.location.href = '/';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex w-full">
      <SidebarProvider defaultOpen={true}>
        <div className="flex w-full">
          <Sidebar>
            <SidebarHeader className="flex h-16 items-center border-b px-6">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6" />
                <span className="font-semibold">MC STORE</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Home">
                        <a href="/">
                          <Home />
                          <span>Home</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Dashboard">
                        <a href="/dashboard">
                          <LayoutDashboard />
                          <span>Dashboard</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Orders">
                        <a href="/dashboard/orders">
                          <ShoppingCart />
                          <span>My Orders</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Profile">
                        <a href="/dashboard/profile">
                          <User />
                          <span>My Profile</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Admin section */}
              <SidebarGroup>
                <SidebarGroupLabel>Administration</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Products">
                        <a href="/admin/products">
                          <Package />
                          <span>Products</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Orders">
                        <a href="/admin/orders">
                          <ShoppingCart />
                          <span>Orders</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Users">
                        <a href="/admin/users">
                          <Users />
                          <span>Users</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="flex flex-col flex-grow">
            <div className="flex items-center h-16 border-b px-6">
              <SidebarTrigger />
            </div>
            <div className="p-6 flex-grow">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
