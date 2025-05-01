import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Footer from "@/components/Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Lock } from "lucide-react";

const updatePasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must contain at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const UpdatePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Check for valid token in URL
  useEffect(() => {
    const checkToken = async () => {
      try {
        console.log("URL Path:", location.pathname);
        console.log("URL Search:", location.search);
        console.log("URL Hash:", location.hash);
        
        // Check for error in URL hash or search params
        if ((location.hash && location.hash.includes('error=')) || 
            (location.search && location.search.includes('error='))) {
            
          console.log("Redirecting to error page");
          // Preserve the original URL params by passing the full URL
          const currentUrl = window.location.href;
          navigate(`/reset-password-error${location.search}${location.hash}`);
          return;
        }
        
        // If we reach this point and there are no other validations,
        // accept the link as valid by default
        return;
        
      } catch (error) {
        console.error("Error in token validation:", error);
        setIsValidLink(false);
        setErrorMessage("An error occurred while validating your reset link. Please request a new one.");
      }
    };
    
    checkToken();
  }, [location, navigate]);

  const handleUpdatePassword = async (values: z.infer<typeof updatePasswordSchema>) => {
    setIsLoading(true);
    try {
      // Simple approach - just update the password
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });
      
      if (error) {
        console.error("Password update error:", error);
        toast({
          title: "Update Password Error",
          description: error.message || "Failed to update password. Please try again or request a new reset link.",
          variant: "destructive",
        });
      } else {
        setIsComplete(true);
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated",
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      }
    } catch (error) {
      console.error("Password update exception:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <Card className="mx-auto max-w-md">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
              <CardDescription>The password reset link is invalid or has expired</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Link Expired</AlertTitle>
                <AlertDescription>
                  {errorMessage || "This link appears to be invalid or has expired. Please request a new password reset link."}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                className="w-full"
                onClick={() => navigate("/auth")}
              >
                Back to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <Card className="mx-auto max-w-md">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Password Updated</CardTitle>
              <CardDescription>Your password has been successfully changed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex justify-center py-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <Alert>
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your password has been updated. You will be redirected to the login page shortly.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                className="w-full"
                onClick={() => navigate("/auth")}
              >
                Back to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <Card className="mx-auto max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Update Password</CardTitle>
            <CardDescription>Create a new secure password</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdatePassword)}>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-blue-50 p-3 rounded-full">
                    <Lock className="h-6 w-6 text-blue-500" />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 8 characters and include uppercase, lowercase, and numbers.
                      </p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button 
                  className="w-full mb-2" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  type="button"
                  onClick={() => navigate("/auth")}
                >
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default UpdatePassword; 