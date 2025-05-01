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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Footer from "@/components/Footer";

// List of Algerian wilayas
const algerianWilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", 
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", 
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", 
  "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", 
  "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", 
  "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", 
  "Ghardaïa", "Relizane", "El M'Ghair", "El Meniaa", "Ouled Djellal", "Bordj Badji Mokhtar", 
  "Béni Abbès", "Timimoun", "Touggourt", "Djanet", "In Salah", "In Guezzam"
];

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  wilaya: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Algeria"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if we should show the reset password form based on location state
  useEffect(() => {
    const state = location.state as { showReset?: boolean } | null;
    if (state && state.showReset) {
      setShowResetPassword(true);
    }
  }, [location]);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetPasswordForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      wilaya: "",
      city: "",
      postalCode: "",
      country: "Algeria",
    },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast({
          title: "Login Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "You are now logged in",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    try {
      // Create the user in auth
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          },
        },
      });

      if (error) {
        toast({
          title: "Registration Error",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // If user was created successfully, create or update the profile with additional data
      if (data.user) {
        // Destructure values without confirmPassword
        const { confirmPassword, ...profileData } = values;
        
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            email: profileData.email,
            phone: profileData.phone,
            address: profileData.address,
            state: profileData.wilaya, // Use wilaya as state
            city: profileData.city,
            postal_code: profileData.postalCode,
            country: profileData.country,
            is_admin: false
          });

        if (profileError) {
          console.warn("Profile creation warning:", profileError);
          // Continue anyway - this is not critical for signup
        }
      }

      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully",
      });
      
      // If registration was successful and email confirmation is not required
      if (data.session) {
        navigate("/dashboard");
      } else {
        // If email confirmation is required
        toast({
          title: "Verification Required",
          description: "Please check your email to confirm your account",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (values: { email: string }) => {
    setIsLoading(true);
    
    try {
      if (!values.email) {
        toast({
          title: "Missing Email",
          description: "Please enter your email address",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Simplified approach - directly send the reset password email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${import.meta.env.VITE_BASE_URL}/reset-password`,
      });
      
      if (resetError) {
        console.error("Reset password error:", resetError);
        toast({
          title: "Reset Error",
          description: resetError.message || "There was a problem sending the reset email. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Success - reset link sent
      toast({
        title: "Password Reset Email Sent",
        description: "A password reset link has been sent to your email address. Please check your inbox and spam folder.",
      });
      
      // Reset the form and go back to login
      const emailInput = document.getElementById('reset-email-input') as HTMLInputElement;
      if (emailInput) {
        emailInput.value = '';
      }
      resetPasswordForm.reset();
      setShowResetPassword(false);
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <Card className="mx-auto max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Authentication</CardTitle>
            <CardDescription>Login or create an account</CardDescription>
          </CardHeader>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              {!showResetPassword ? (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                    <CardContent className="space-y-4 pt-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="example@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="flex flex-col">
                      <Button className="w-full mb-2" type="submit" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                      </Button>
                      <Button 
                        variant="link" 
                        className="px-0 text-sm text-blue-500" 
                        type="button"
                        onClick={() => setShowResetPassword(true)}
                      >
                        Forgot your password?
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              ) : (
                <div>
                  <CardContent className="space-y-4 pt-4">
                    <div className="mb-4 text-center">
                      <h3 className="text-lg font-medium">Reset Your Password</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Enter your email to receive a password reset link
                      </p>
                    </div>
                    
                    {/* Plain HTML form for password reset */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const emailInput = document.getElementById('reset-email-input') as HTMLInputElement;
                        if (emailInput && emailInput.value) {
                          handleResetPassword({ email: emailInput.value });
                        }
                      }}
                      id="simple-reset-form"
                    >
                      <div className="space-y-2">
                        <label htmlFor="reset-email-input" className="text-sm font-medium">
                          Email Address
                        </label>
                        <input
                          id="reset-email-input"
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          autoComplete="email"
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck="false"
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>

                      <div className="text-sm text-gray-500 space-y-2 mt-4">
                        <p>
                          Enter the email you used when creating your account.
                        </p>
                        <p>
                          If you don't receive an email within a few minutes, check your spam folder.
                        </p>
                      </div>
                      
                      <div className="flex flex-col space-y-2 mt-6">
                        <Button 
                          className="w-full" 
                          type="submit" 
                          disabled={isLoading}
                        >
                          {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          type="button"
                          onClick={() => {
                            setShowResetPassword(false);
                            resetPasswordForm.reset();
                          }}
                        >
                          Back to Login
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </div>
              )}
            </TabsContent>
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="example@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">
                            Password must be at least 8 characters with at least one uppercase letter, 
                            one number, and one special character.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+213 XXX XXX XXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Your street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="wilaya"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wilaya</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select wilaya" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {algerianWilayas.map((wilaya) => (
                                  <SelectItem key={wilaya} value={wilaya}>
                                    {wilaya}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Postal code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Country" {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <Button className="w-full mb-2" type="submit" disabled={isLoading}>
                      {isLoading ? "Registering..." : "Register"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
