import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { getProductReviews } from '@/lib/api';

interface Review {
  id: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  rating: number;
  comment?: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        // Validate productId
        if (!productId || productId === 'undefined') {
          console.warn('Invalid productId provided to ProductReviews:', productId);
          setError('Invalid product ID');
          setLoading(false);
          return;
        }
        
        console.log('Fetching reviews for product:', productId);
        const data = await getProductReviews(productId);
        console.log('Received reviews data:', data);
        
        // Validate that data is an array
        if (!Array.isArray(data)) {
          console.error('Expected array of reviews but got:', typeof data);
          setError('Error loading reviews');
          setLoading(false);
          return;
        }
        
        // Process the reviews to ensure rating is a number
        const processedReviews = data.map(review => ({
          ...review,
          rating: typeof review.rating === 'string' ? parseInt(review.rating, 10) : review.rating
        }));
        
        setReviews(processedReviews);
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  // Helper function to get user initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    
    const parts = name.split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return (
      parts[0].charAt(0).toUpperCase() + 
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={`star-${i}`} 
          className={`h-4 w-4 ${i <= roundedRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
        />
      );
    }
    
    return <div className="flex">{stars}</div>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-4">Loading reviews...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-4 text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-4 text-gray-500">No reviews yet. Be the first to review this product!</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex items-start">
              <Avatar className="h-10 w-10 mr-4">
                <AvatarFallback>{getInitials(review.user?.name)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <div>
                    <div className="font-semibold">
                      {review.user?.name || review.user?.email || 'Anonymous'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </div>
                  </div>
                  
                  <div className="mt-1 sm:mt-0">
                    {renderStarRating(review.rating)}
                  </div>
                </div>
                
                {review.comment && (
                  <div className="mt-2 text-gray-700">
                    {review.comment}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductReviews; 