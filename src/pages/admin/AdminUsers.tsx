import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "@/App";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Profile } from "@/types/database.types";
import { supabase } from "@/integrations/supabase/client";

const AdminUsers = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
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
          fetchUsers();
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

  const fetchUsers = async () => {
    try {
      // Fetch user profiles from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      console.log('Supabase profiles data:', data);
      console.log('Supabase profiles error:', error);
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Unable to load users from database",
        variant: "destructive",
      });
    }
  };

  const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    // Don't allow users to remove their own admin status
    if (userId === user?.id && !isAdmin) {
      toast({
        title: "Action not allowed",
        description: "You cannot remove your own admin privileges",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update admin status in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          is_admin: isAdmin
        })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }

      toast({
        title: "Status updated",
        description: `User is now ${isAdmin ? "an administrator" : "a regular user"}`,
      });

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_admin: isAdmin } : u
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Error",
        description: "Unable to update user status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center my-12">
          <p>Chargement...</p>
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
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-muted-foreground">
            View and manage all users
          </p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead className="text-center">Administrator</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userItem) => (
                <TableRow key={userItem.id}>
                  <TableCell className="font-medium">
                    {userItem.first_name && userItem.last_name
                      ? `${userItem.first_name} ${userItem.last_name}`
                      : "User"}
                    {userItem.id === user?.id && " (You)"}
                  </TableCell>
                  <TableCell>{userItem.email || "No email"}</TableCell>
                  <TableCell>{userItem.phone || "Not defined"}</TableCell>
                  <TableCell>
                    {new Date(userItem.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={userItem.is_admin}
                      onCheckedChange={(checked) =>
                        toggleAdminStatus(userItem.id, checked)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-muted-foreground">
                      No users found.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
