import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api';
import axios from 'axios';

// Create a direct API instance for better control - use environment variable if available
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  manufacturer?: string;
  fullImageUrl?: string;
  directMediaUrl?: string;
  productsMediaUrl?: string;
}

const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'home', label: 'Home & Kitchen' },
  { value: 'beauty', label: 'Beauty & Personal Care' },
  { value: 'sports', label: 'Sports & Outdoors' },
  { value: 'books', label: 'Books' },
  { value: 'toys', label: 'Toys & Games' },
  { value: 'other', label: 'Other' },
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    manufacturer: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Add backend URL constant
  const BACKEND_URL = 'http://localhost:8000';

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        toast({
          title: "Access Denied",
          description: "Please login to access the admin panel",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      if (!user || user.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        await fetchProducts();
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, user, navigate, refreshTrigger]);

  const fetchProducts = async (queryParam?: string) => {
    try {
      console.log('Admin: Fetching products...');
      
      // Force a fresh fetch by adding a timestamp to bypass cache
      const timestamp = new Date().getTime();
      const query = queryParam || `?t=${timestamp}`;
      console.log(`Using query parameter: ${query}`);
      
      // Use direct API call instead of the getProducts function
      // Fix the URL format - remove trailing slash
      const url = `/products/list${query}`;
      console.log(`Making API request to: ${url}`);
      const response = await api.get(url);
      
      console.log('Admin fetchProducts response:', response.data);
      
      // Handle both array format and object with products property
      let productsList = [];
      
      if (Array.isArray(response.data)) {
        console.log('Response is an array');
        productsList = response.data;
      } else if (response.data && typeof response.data === 'object') {
        console.log('Response is an object:', response.data);
        if (response.data.products) {
          productsList = response.data.products;
        } else {
          // If neither array nor has products property, use the object itself
          productsList = [response.data];
        }
      }
      
      // Add debugging for image URLs
      if (productsList && productsList.length > 0) {
        console.log('First product image URL:', productsList[0].imageUrl);
        
        // Process each product to ensure image URLs are correctly formatted
        productsList = productsList.map(product => {
          // Convert image_url to imageUrl if needed
          if (!product.imageUrl && product.image_url) {
            product.imageUrl = product.image_url;
          }
          
          // Check for image_url field from Django backend
          if (product.image_url) {
            console.log(`Product ${product.name} has image_url:`, product.image_url);
            product.imageUrl = product.image_url;
          }
          
          console.log(`Processing product ${product.name}, image URL:`, product.imageUrl);
          
          // Make sure imageUrl is properly formatted
          if (product.imageUrl && !product.imageUrl.startsWith('http') && !product.imageUrl.startsWith('/')) {
            console.log(`Fixing image URL for ${product.name}`);
            product.imageUrl = `/${product.imageUrl}`;
          }
          
          return product;
        });
      }
      
      console.log('Processed products list:', productsList);
      setProducts(productsList || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch products',
        variant: 'destructive',
      });
      // Set empty array to prevent infinite loading state
      setProducts([]);
      throw error;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for price field
    if (name === 'price') {
      // Allow only valid decimal numbers (digits, one decimal point, and up to 2 decimal places)
      if (value === '' || /^(\d+)?(\.\d{0,2})?$/.test(value)) {
        // If the value is valid, update the form data
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Log the price value for debugging
        console.log(`Price input changed: ${value}`);
      }
      return;
    }
    
    // Special handling for stock field
    if (name === 'stock') {
      // Allow only positive integers
      if (value === '' || /^\d+$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }
    
    // Default handling for other fields
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create form data for product details
      const productData = new FormData();
      
      // Add all form fields except image
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'image' && value !== undefined) {
          productData.append(key, value.toString());
        }
      });
      
      try {
        // Use the custom endpoint for updating products
        const response = await api.post(`/products/products/${editingProduct}/update-product/`, productData);
        console.log('Product data updated successfully:', response.data);
        
        // Then update the image if selected
        if (selectedImage) {
          console.log('Uploading image separately');
          const imageFormData = new FormData();
          imageFormData.append('image', selectedImage);
          
          try {
            console.log('Image form data:', Object.fromEntries(imageFormData.entries()));
            
            // Use the dedicated image upload endpoint
            const imageResponse = await api.post(`/products/products/${editingProduct}/upload_image/`, imageFormData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            console.log('Image upload response:', imageResponse.data);
            
            // Show success message
            toast({
              title: 'Success',
              description: 'Product and image updated successfully',
            });
            
            // Force a refresh to ensure the updated image is displayed
            await fetchProducts();
          } catch (imageError) {
            console.error('Error uploading image:', imageError);
            // Log detailed error information
            if (imageError.response) {
              console.error('Image upload error response:', imageError.response.data);
              console.error('Image upload error status:', imageError.response.status);
              
              // Show more specific error message
              let errorMessage = 'Image upload failed';
              if (imageError.response.data && imageError.response.data.error) {
                errorMessage = imageError.response.data.error;
              } else if (imageError.response.data && imageError.response.data.detail) {
                errorMessage = imageError.response.data.detail;
              } else if (typeof imageError.response.data === 'string') {
                errorMessage = imageError.response.data;
              }
              
              toast({
                title: 'Warning',
                description: `Product updated but ${errorMessage}`,
                variant: 'destructive',
              });
            } else {
              toast({
                title: 'Warning',
                description: 'Product updated but image upload failed',
                variant: 'destructive',
              });
            }
          } finally {
            // Make sure to set loading to false even if image upload fails
            setIsLoading(false);
            // Reset form after successful update
            resetForm();
            // Force a refresh to ensure we have the latest data
            await fetchProducts();
          }
        } else {
          // If no image to upload, show success message
          toast({
            title: 'Success',
            description: 'Product updated successfully',
          });
          // If no image to upload, still need to reset loading and form
          setIsLoading(false);
          resetForm();
          // Force a refresh to ensure we have the latest data
          await fetchProducts();
        }
      } catch (error) {
        console.error('Error updating product:', error);
        
        // Extract more detailed error information
        let errorMessage = 'Failed to update product';
        
        if (error.response) {
          console.error('Error response:', error.response);
          
          // Try to get the most specific error message
          if (error.response.data) {
            console.log('Error data:', JSON.stringify(error.response.data));
            
            if (error.response.data.detail) {
              errorMessage = error.response.data.detail;
            } else if (error.response.data.error) {
              errorMessage = error.response.data.error;
            } else if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            } else if (Object.keys(error.response.data).length > 0) {
              // If it's a validation error with field-specific messages
              const firstField = Object.keys(error.response.data)[0];
              const firstError = error.response.data[firstField];
              errorMessage = `${firstField}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
            }
          }
          
          // Add status code for debugging
          errorMessage += ` (Status: ${error.response.status})`;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      
      // Extract more detailed error information
      let errorMessage = 'Failed to update product';
      
      if (error.response) {
        console.error('Error response:', error.response);
        
        // Try to get the most specific error message
        if (error.response.data) {
          errorMessage = JSON.stringify(error.response.data);
        }
        
        // Add status code for debugging
        errorMessage += ` (Status: ${error.response.status})`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create form data
      const productData = new FormData();
      
      // Add all form fields except image
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'image' && value !== undefined) {
          productData.append(key, value.toString());
        }
      });
      
      // First create the product without the image
      const response = await createProduct(productData);
      console.log('Product created successfully:', response);
      
      // Then upload the image if selected
      if (selectedImage && response.id) {
        console.log('Uploading image for new product');
        const imageFormData = new FormData();
        imageFormData.append('image', selectedImage);
        
        try {
          console.log('Image form data:', Object.fromEntries(imageFormData.entries()));
          
          // Use the dedicated image upload endpoint
          const imageResponse = await api.post(`/products/products/${response.id}/upload_image/`, imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          console.log('Image upload response:', imageResponse.data);
          
          // Show success message with image
          toast({
            title: 'Success',
            description: 'Product and image added successfully',
          });
          
          // Force a refresh to ensure the new product with image is displayed
          await fetchProducts();
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          // Log detailed error information
          if (imageError.response) {
            console.error('Image upload error response:', imageError.response.data);
            console.error('Image upload error status:', imageError.response.status);
            
            // Show more specific error message
            let errorMessage = 'Image upload failed';
            if (imageError.response.data && imageError.response.data.error) {
              errorMessage = imageError.response.data.error;
            } else if (imageError.response.data && imageError.response.data.detail) {
              errorMessage = imageError.response.data.detail;
            } else if (typeof imageError.response.data === 'string') {
              errorMessage = imageError.response.data;
            }
            
            toast({
              title: 'Warning',
              description: `Product added but ${errorMessage}`,
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Warning',
              description: 'Product added but image upload failed',
              variant: 'destructive',
            });
          }
        } finally {
          // Make sure to set loading to false and reset form even if image upload fails
          setIsLoading(false);
          resetForm();
          // Force a refresh to ensure we have the latest data
          await fetchProducts();
        }
      } else {
        // Show success message without image
        toast({
          title: 'Success',
          description: 'Product added successfully',
        });
        // If no image to upload, still need to reset loading and form
        setIsLoading(false);
        resetForm();
        // Force a refresh to ensure we have the latest data
        await fetchProducts();
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      
      // Extract more detailed error information
      let errorMessage = 'Failed to save product';
      
      if (error.response) {
        console.error('Error response:', error.response);
        
        // Try to get the most specific error message
        if (error.response.data) {
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (Object.keys(error.response.data).length > 0) {
            // If it's a validation error with field-specific messages
            const firstField = Object.keys(error.response.data)[0];
            const firstError = error.response.data[firstField];
            errorMessage = `${firstField}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
          } else {
            errorMessage = JSON.stringify(error.response.data);
          }
        }
        
        // Add status code for debugging
        errorMessage += ` (Status: ${error.response.status})`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    console.log('Editing product:', product);
    
    // Get the correct ID (either _id or id)
    const productId = product.id || product._id;
    console.log('Using product ID for edit:', productId);
    
    // Log the entire product object for debugging
    console.log('Full product object:', JSON.stringify(product, null, 2));
    
    // Format price with 2 decimal places as a string
    const formattedPrice = typeof product.price === 'number' 
      ? product.price.toFixed(2) 
      : parseFloat(String(product.price)).toFixed(2);
    
    console.log(`Formatting price for edit: ${product.price} -> ${formattedPrice}`);
    
    setFormData({
      name: product.name,
      description: product.description,
      price: formattedPrice,
      category: product.category,
      stock: product.stock.toString(),
      manufacturer: product.manufacturer || ''
    });
    
    // Process the image URL for preview
    let imagePreviewUrl = null;
    if (product.imageUrl) {
      if (product.imageUrl.startsWith('http')) {
        imagePreviewUrl = product.imageUrl;
      } else if (product.imageUrl.startsWith('/media')) {
        imagePreviewUrl = `${BACKEND_URL}${product.imageUrl}`;
      } else {
        imagePreviewUrl = `${BACKEND_URL}/media/${product.imageUrl}`;
      }
      console.log('Setting image preview URL:', imagePreviewUrl);
    }
    
    setImagePreview(imagePreviewUrl);
    setEditingProduct(productId);
    
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      setIsLoading(true);
      const result = await deleteProduct(id);
      console.log('Product deleted successfully:', result);
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      
      // Add a small delay before fetching products to ensure the backend has processed the changes
      setTimeout(async () => {
        try {
          await fetchProducts();
        } catch (error) {
          console.error('Error fetching products after delete:', error);
        } finally {
          setIsLoading(false);
        }
      }, 500);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      
      // Extract more detailed error information
      let errorMessage = 'Failed to delete product';
      
      if (error.response) {
        console.error('Error response:', error.response);
        
        // Try to get the most specific error message
        if (error.response.data) {
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
        }
        
        // Add status code for debugging
        errorMessage += ` (Status: ${error.response.status})`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      manufacturer: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingProduct(null);
  };

  // Function to force refresh
  const forceRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        <Button
          onClick={() => navigate('/admin/orders')}
          className="bg-[#9b87f5] hover:bg-[#7E69AB]"
        >
          Manage Orders
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
            <div>
              <Input
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Textarea
                name="description"
                placeholder="Product Description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="price"
                type="text"
                placeholder="Price"
                value={formData.price}
                onChange={handleInputChange}
                pattern="^\d*(\.\d{0,2})?$"
                title="Please enter a valid price with up to 2 decimal places"
                required
              />
              <Input
                name="stock"
                type="number"
                placeholder="Stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Input
                name="manufacturer"
                placeholder="Manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={isLoading} className="bg-[#9b87f5] hover:bg-[#7E69AB]">
                {isLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
              {editingProduct && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products List</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  // Log the image URL for debugging
                  console.log(`Product ${product.name} image URL:`, product.imageUrl);
                  
                  // Construct the image URL with detailed logging
                  let imageUrl = 'https://placehold.co/100x100?text=No+Image';
                  
                  if (product.imageUrl) {
                    if (product.imageUrl.startsWith('http')) {
                      imageUrl = product.imageUrl;
                      console.log(`Using direct URL for ${product.name}:`, imageUrl);
                    } else if (product.imageUrl.startsWith('/media')) {
                      imageUrl = `${BACKEND_URL}${product.imageUrl}`;
                      console.log(`Using /media URL for ${product.name}:`, imageUrl);
                    } else {
                      imageUrl = `${BACKEND_URL}/media/${product.imageUrl}`;
                      console.log(`Using constructed URL for ${product.name}:`, imageUrl);
                    }
                  } else {
                    console.log(`No image URL for ${product.name}, using placeholder`);
                  }
                  
                  return (
                    <TableRow key={product._id}>
                      <TableCell>
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded border"
                          onError={(e) => {
                            console.error(`Image failed to load for ${product.name}, URL was: ${(e.target as HTMLImageElement).src}`);
                            // Use a public placeholder image that definitely exists
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                          }}
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{product.description}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.manufacturer}</TableCell>
                      <TableCell>₹{product.price}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="mr-2"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No products found</p>
              <p className="text-sm text-gray-400">Add your first product using the form above</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin; 