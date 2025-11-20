import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { createProductReview } from '@/lib/api';

interface ProductReviewFormProps {
  productId: string;
  productName: string;
  onReviewSubmitted: () => void;
}

const ProductReviewForm = ({ productId, productName, onReviewSubmitted }: ProductReviewFormProps) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate inputs
      if (rating < 1 || rating > 5) {
        setError('Please select a rating between 1 and 5 stars');
        return;
      }
      
      if (!comment.trim()) {
        setError('Please enter a comment for your review');
        return;
      }
      
      // Validate productId
      if (!productId || productId === 'undefined') {
        console.error('Invalid productId in ProductReviewForm:', productId);
        setError('Invalid product ID. Please try again later.');
        return;
      }
      
      setIsSubmitting(true);
      setError(null);
      
      console.log(`Submitting review for product ${productId} with rating ${rating} and comment: ${comment}`);
      
      // Submit the review
      await createProductReview(productId, rating, comment);
      
      // Clear form and show success message
      setComment('');
      setRating(5);
      
      toast({
        title: 'Review submitted',
        description: `Your review for ${productName} has been submitted successfully.`,
      });
      
      // Notify parent component
      onReviewSubmitted();
      
    } catch (err: any) {
      console.error('Error submitting review:', err);
      
      // Extract error message
      let errorMessage = 'Failed to submit review. Please try again.';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      
      {/* Comment */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Review
        </label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this product..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full"
        />
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

export default ProductReviewForm; 