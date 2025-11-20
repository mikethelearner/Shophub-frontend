import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Star, ShoppingBag } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useNavigate, useLocation } from 'react-router-dom';

// Add backend URL constant
const BACKEND_URL = 'http://localhost:8000';

const Shop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const { addToCart } = useCart();

  // Define categories with their display names
  const categories = [
    "All Products",
    "Electronics",
    "Fashion",
    "Home & Kitchen",
    "Beauty & Personal Care",
    "Sports & Outdoors",
    "Books",
    "Toys & Games"
  ];

  // Map display categories to database categories
  const categoryMapping: Record<string, string> = {
    "Electronics": "electronics",
    "Fashion": "clothing",
    "Home & Kitchen": "home",
    "Beauty & Personal Care": "beauty",
    "Sports & Outdoors": "sports",
    "Books": "books",
    "Toys & Games": "toys"
  };

  // Parse URL parameters when component mounts
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
      console.log('Setting category from URL:', categoryParam);
    }
  }, [location.search]);

  // Get the database category value for API filtering
  const getDatabaseCategory = (displayCategory: string | null) => {
    if (!displayCategory || displayCategory === "All Products") return null;
    const dbCategory = categoryMapping[displayCategory] || displayCategory.toLowerCase();
    console.log(`Mapping display category "${displayCategory}" to database category "${dbCategory}"`);
    return dbCategory;
  };

  const apiCategory = selectedCategory && selectedCategory !== "All Products" 
    ? getDatabaseCategory(selectedCategory) as string 
    : undefined;

  console.log('Category for API request:', {
    selectedCategory,
    apiCategory,
    categoriesParam: apiCategory ? [apiCategory] : undefined
  });

  const { data, isLoading, error: apiError, refetch } = useProducts({
    search: searchQuery,
    categories: apiCategory ? [apiCategory] : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
  });

  useEffect(() => {
    console.log('Products data:', {
      data,
      isLoading,
      apiError,
      selectedCategory,
      searchQuery,
      priceRange
    });
  }, [data, isLoading, apiError, selectedCategory, searchQuery, priceRange]);

  const handleAddToCart = (product: any) => {
    console.log('Adding product to cart (Shop.tsx):', product);
    addToCart(product);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setPriceRange([0, 1000]);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (isLoading) {
    console.log('Showing loading state');
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (apiError) {
    console.error('Error loading products:', apiError);
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Error loading products. Please try again later.</div>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const filteredProducts = data?.products || [];
  console.log('Rendering products:', filteredProducts);

  return (
    <div className="min-h-screen bg-[#F1F0FB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Shop Products</h2>

        {/* Search and Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Select
                value={selectedCategory || ""}
                onValueChange={(value) => setSelectedCategory(value === "All Products" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Price Range: ${priceRange[0]} - ${priceRange[1]}</span>
                </div>
                <Slider
                  defaultValue={[0, 1000]}
                  min={0}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="bg-[#3b82f6]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No products found matching your criteria.</p>
              <Button onClick={clearFilters} className="mt-4 bg-[#3b82f6] hover:bg-[#2563eb]">
                Reset Filters
              </Button>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card 
                key={product._id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleProductClick(product._id)}
              >
                <div className="aspect-square bg-gray-100 p-4">
                  <div className="w-full h-full flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl.startsWith('http') 
                          ? product.imageUrl 
                          : product.imageUrl.startsWith('/') 
                            ? `${BACKEND_URL}${product.imageUrl}` 
                            : `${BACKEND_URL}/${product.imageUrl}`}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error('Image load error for:', product.name, product.imageUrl);
                          const target = e.currentTarget as HTMLImageElement;
                          target.src = 'https://placehold.co/200x200?text=No+Image';
                        }}
                      />
                    ) : (
                      <ShoppingBag className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">₹{product.price.toFixed(2)}</span>
                    <Button
                      size="sm"
                      className="bg-[#3b82f6] hover:bg-[#2563eb]"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation when clicking the button
                        handleAddToCart(product);
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
