import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "@/App";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { formatPrice } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Trash } from "lucide-react";
import { Product } from "@/types/database.types";
import { supabase } from "@/integrations/supabase/client";

// Define product categories
const productCategories = [
  "smartphones",
  "laptops",
  "tablets",
  "accessories",
  "headphones",
  "speakers",
  "cameras",
  "wearables",
  "gaming",
  "other"
];

// Define the product schema
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  category_id: z.string().min(1, "Category is required"),
  image_url: z.string().url("Image URL must be valid"),
  in_stock: z.boolean().default(true),
  featured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

// Define a category interface
interface Category {
  id: string;
  name: string;
}

const AdminProducts = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{id: string, name: string}[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category_id: "",
      image_url: "",
      in_stock: true,
      featured: false,
    },
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        // Show access denied page instead of redirecting to auth
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.log("Checking admin status for user:", user.id);
      
      try {
        // Check for admin role in the user's profile
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        console.log("Profile data received:", profileData);
        
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
          fetchProducts();
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
  }, [user, navigate, toast]);

  const fetchProducts = async () => {
    try {
      // Fetch products from Supabase database
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log("Fetched products:", data);
        console.log("Products with numeric_id:", data.filter(p => p.numeric_id !== undefined && p.numeric_id !== null).length);
        console.log("Products without numeric_id:", data.filter(p => p.numeric_id === undefined || p.numeric_id === null).length);
        
        // Ensure all products have a numeric_id in the local state
        const productsWithNumericId = ensureNumericIds(data);
        setProducts(productsWithNumericId);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Unable to load products from database",
        variant: "destructive",
      });
    }
  };

  // Helper function to ensure all products have a numeric_id in the local state
  const ensureNumericIds = (products: Product[]): Product[] => {
    console.log("Ensuring all products have numeric_id");
    
    // First, separate products with and without numeric_id
    const withNumericId = products.filter(p => p.numeric_id !== undefined && p.numeric_id !== null);
    const withoutNumericId = products.filter(p => p.numeric_id === undefined || p.numeric_id === null);
    
    console.log(`Found ${withNumericId.length} products with numeric_id and ${withoutNumericId.length} without`);
    
    // If all products have numeric_id, return as is
    if (withoutNumericId.length === 0) {
      return products;
    }
    
    // Find the maximum existing numeric_id
    const maxNumericId = withNumericId.length > 0
      ? Math.max(...withNumericId.map(p => p.numeric_id || 0))
      : 0;
    
    console.log(`Maximum existing numeric_id: ${maxNumericId}`);
    
    // Assign sequential numeric_ids to products without one
    let nextId = maxNumericId + 1;
    const updatedProducts = [...withNumericId];
    
    for (const product of withoutNumericId) {
      updatedProducts.push({
        ...product,
        numeric_id: nextId++
      });
      
      // Also update in the database
      updateProductNumericId(product.id, nextId - 1);
    }
    
    return updatedProducts;
  };
  
  // Function to update a product's numeric_id in the database
  const updateProductNumericId = async (productId: string, numericId: number) => {
    try {
      console.log(`Updating product ${productId} with numeric_id ${numericId} in database`);
      
      const { error } = await supabase
        .from('products')
        .update({ numeric_id: numericId })
        .eq('id', productId);
        
      if (error) {
        console.error("Error updating numeric_id:", error);
      } else {
        console.log(`Product ${productId} numeric_id updated successfully`);
      }
    } catch (error) {
      console.error("Exception updating numeric_id:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      // Fetch categories from the categories table
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }
      
      if (data) {
        setCategoriesData(data);
        
        // Create options for the select dropdown
        const options = data.map(category => ({
          id: category.id,
          name: category.name
        }));
        
        setCategoryOptions(options);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Set some default options if needed
      setCategoryOptions([
        { id: "1", name: "Smartphones" },
        { id: "2", name: "Laptops" },
        { id: "3", name: "Accessories" }
      ]);
    }
  };

  useEffect(() => {
    // Fetch categories when component mounts
    fetchCategories();
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      description: "",
      price: 0,
      category_id: "",
      image_url: "",
      in_stock: true,
      featured: false,
    });
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: product.category_id,
      image_url: product.image_url,
      in_stock: product.in_stock,
      featured: product.featured,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      console.log("Deleting product with id:", id);
      
      // Delete from Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }
      
      console.log("Product deleted successfully from Supabase");
      
      // Remove from local state
      setProducts(products.filter(p => p.id !== id));
      
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Unable to delete the product",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (editingProduct) {
        // Update existing product in Supabase
        const { error } = await supabase
          .from('products')
          .update({
            name: values.name,
            description: values.description,
            price: values.price,
            category_id: values.category_id,
            image_url: values.image_url,
            in_stock: values.in_stock,
            featured: values.featured,
            updated_at: new Date().toISOString()
            // numeric_id is intentionally not updated
          })
          .eq('id', editingProduct.id);
          
        if (error) {
          throw error;
        }
        
        // Update the product in local state
        const updatedProducts = products.map(p => 
          p.id === editingProduct.id 
            ? { 
                ...p, 
                name: values.name,
                description: values.description,
                price: values.price,
                category_id: values.category_id,
                image_url: values.image_url,
                in_stock: values.in_stock,
                featured: values.featured,
                updated_at: new Date().toISOString() 
                // numeric_id remains unchanged
              } 
            : p
        );
        
        setProducts(updatedProducts);
        
        toast({
          title: "Product updated",
          description: "The product has been successfully updated",
        });
      } else {
        // Create new product in Supabase
        
        // Calculate a new numeric_id for the product (max existing numeric_id + 1)
        // First check if all products have a numeric_id already
        const productsWithNumericId = products.filter(p => p.numeric_id !== undefined && p.numeric_id !== null);
        let maxNumericId = 0;
        
        if (productsWithNumericId.length > 0) {
          maxNumericId = Math.max(...productsWithNumericId.map(p => p.numeric_id || 0));
        }
        
        const newNumericId = maxNumericId + 1;
        
        console.log("Calculating new numeric_id:");
        console.log("Products with numeric_id:", productsWithNumericId.length);
        console.log("Max numeric_id found:", maxNumericId);
        console.log("New numeric_id will be:", newNumericId);
        
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: values.name,
            description: values.description,
            price: values.price,
            category_id: values.category_id,
            image_url: values.image_url,
            in_stock: values.in_stock,
            featured: values.featured,
            numeric_id: newNumericId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Add the new product to the local state
          setProducts([data, ...products]);
          
          toast({
            title: "Product added",
            description: "The product has been successfully added",
          });
        }
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Unable to save the product",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Function to get category name from category_id
  const getCategoryName = (category_id: string) => {
    const category = categoriesData.find(cat => cat.id === category_id);
    return category ? category.name : category_id;
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
          <p>You don't have admin privileges</p>
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Products</h1>
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.numeric_id || "N/A"}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{getCategoryName(product.category_id)}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    {product.in_stock ? (
                      <span className="text-green-600">In Stock</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.featured ? (
                      <span className="text-brand-orange">Yes</span>
                    ) : (
                      <span>No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">
                      No products found. Add your first product.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Product description"
                        {...field}
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="in_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">In Stock</SelectItem>
                          <SelectItem value="false">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminProducts;

