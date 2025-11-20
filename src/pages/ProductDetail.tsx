import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, ShoppingBag, Plus, Minus, Star, StarHalf } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import axios from 'axios';
import ProductReviewForm from '@/components/ProductReviewForm';
import ProductReviews from '@/components/ProductReviews';
import { createProductReview, getProductReviews } from '@/lib/api';

// Add backend URL constant - use environment variable if available
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

// API instance - use environment variable if available
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
  price: number | string;
  category: string;
  imageUrl?: string;
  image_url?: string;
  stock: number;
  manufacturer?: string;
}

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [hasUserPurchased, setHasUserPurchased] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [refreshReviews, setRefreshReviews] = useState<number>(0);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching product with ID:', productId);
        
        if (!productId) {
          setError('Product ID is missing');
          setIsLoading(false);
          return;
        }
        
        const response = await api.get(`/products/detail/${productId}/`);
        console.log('Product detail response:', response.data);
        
        // Process the response data to ensure imageUrl is set and price is a number
        const productData = response.data;
        
        // Handle image URL
        if (productData.image_url && !productData.imageUrl) {
          productData.imageUrl = productData.image_url;
        }
        
        // Handle price - ensure it's a number
        if (productData.price) {
          // Convert price to a number if it's a string or Decimal128 object
          productData.price = parseFloat(String(productData.price));
        }
        
        // Handle stock - ensure it's a number
        if (productData.stock) {
          productData.stock = parseInt(String(productData.stock), 10);
        }
        
        console.log('Processed product data:', productData);
        setProduct(productData);
        
        // Set average rating from product data if available
        if (productData.rating) {
          setAverageRating(parseFloat(String(productData.rating)));
        }
      } catch (err: any) {
        console.error('Error fetching product details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Fetch user orders to check if they've purchased this product
  useEffect(() => {
    const fetchUserOrders = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await api.get('/orders/my-orders/');
          setUserOrders(response.data);
          
          // Check if user has purchased this product and the order is delivered or delivery confirmed
          const hasPurchased = response.data.some((order: any) => {
            return (
              (order.status === 'delivered' || order.status === 'delivery_confirmed') &&
              order.items.some((item: any) => {
                const itemProductId = item.product.id || item.product._id;
                return itemProductId === productId;
              })
            );
          });
          
          setHasUserPurchased(hasPurchased);
        } catch (err) {
          console.error('Error fetching user orders:', err);
        }
      }
    };
    
    fetchUserOrders();
  }, [isAuthenticated, user, productId]);

  // Fetch review count
  useEffect(() => {
    const fetchReviewCount = async () => {
      if (productId) {
        try {
          console.log('Fetching review count for product:', productId);
          const reviews = await getProductReviews(productId);
          console.log('Fetched reviews:', reviews);
          setReviewCount(Array.isArray(reviews) ? reviews.length : 0);
        } catch (err) {
          console.error('Error fetching review count:', err);
          // Don't set an error state here, just log it
        }
      }
    };
    
    fetchReviewCount();
  }, [productId, refreshReviews]);

  const handleAddToCart = () => {
    if (product) {
      // Create a normalized product object with price as a number
      const normalizedProduct = {
        ...product,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      };
      
      // Add the product to cart with the selected quantity
      for (let i = 0; i < quantity; i++) {
        addToCart(normalizedProduct);
      }
      
      toast({
        title: 'Added to cart',
        description: `${quantity} ${product.name} ${quantity > 1 ? 'have' : 'has'} been added to your cart.`,
      });
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleReviewSubmitted = () => {
    // Refresh reviews by incrementing the refresh counter
    setRefreshReviews(prev => prev + 1);
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-5 w-5 text-gray-300" />);
    }
    
    return stars;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/shop')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
        </Button>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error || 'Product not found'}</div>
          <Button onClick={() => navigate('/shop')}>Return to Shop</Button>
        </div>
      </div>
    );
  }

  // Format price as a number for display
  const formattedPrice = typeof product.price === 'string' 
    ? parseFloat(product.price).toFixed(2) 
    : product.price.toFixed(2);

  return (
    <div className="min-h-screen bg-[#F1F0FB] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/shop')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
        </Button>

        <Card className="overflow-hidden mb-8">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="bg-white p-6 flex items-center justify-center">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl.startsWith('http') ? product.imageUrl : `${BACKEND_URL}${product.imageUrl}`} 
                    alt={product.name} 
                    className="max-h-[300px] object-contain"
                  />
                ) : (
                  <div className="h-[300px] w-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No image available
                  </div>
                )}
              </div>
              
              {/* Product Details */}
              <div className="p-6 flex flex-col">
                <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {renderStarRating(averageRating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
                
                <div className="text-xl font-semibold mb-4">${formattedPrice}</div>
                
                <p className="text-gray-700 mb-6">{product.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <span className="font-semibold mr-2">Category:</span>
                    <span className="capitalize">{product.category}</span>
                  </div>
                  
                  {product.manufacturer && (
                    <div className="flex items-center mb-2">
                      <span className="font-semibold mr-2">Manufacturer:</span>
                      <span>{product.manufacturer}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">Availability:</span>
                    <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                    </span>
                  </div>
                </div>
                
                {product.stock > 0 && (
                  <div className="mt-auto">
                    <div className="flex items-center mb-4">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-4 font-medium">{quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={incrementQuantity}
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleAddToCart}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Reviews Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
          <ProductReviews productId={productId || ''} />
        </div>
        
        {/* Review Form - Only show if user has purchased this product */}
        {isAuthenticated && hasUserPurchased && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Write a Review</h2>
            <ProductReviewForm 
              productId={productId || ''} 
              productName={product.name}
              onReviewSubmitted={handleReviewSubmitted}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 