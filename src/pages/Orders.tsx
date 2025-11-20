import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserOrders, requestOrderCancellation, confirmOrderDelivery } from '@/lib/api';
import useAuth from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { 
  Loader2, Package, ShoppingBag, Truck, CheckCircle, XCircle, 
  Clock, RefreshCw, CheckCircle2, AlertCircle, ThumbsUp, HelpCircle, Star 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import ProductReviewForm from '@/components/ProductReviewForm';

interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  } | string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip_code?: string;
}

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isCancellationDialogOpen, setIsCancellationDialogOpen] = useState(false);
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{id: string, name: string} | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserOrders();
        console.log('Orders data:', data);
        
        // Process and normalize the orders data
        const processedOrders = Array.isArray(data) ? data.map((order: any) => ({
          ...order,
          // Handle shipping address in different formats
          shipping_address: typeof order.shipping_address === 'object' ? order.shipping_address : 
                           typeof order.shipping_address === 'string' ? order.shipping_address : '',
          
          // Store direct shipping fields if available
          shipping_street: order.shipping_street || '',
          shipping_city: order.shipping_city || '',
          shipping_state: order.shipping_state || '',
          shipping_zip_code: order.shipping_zip_code || ''
        })) : [];
        
        setOrders(processedOrders);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        setError(error.response?.data?.error || 'Failed to fetch orders');
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to fetch orders',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  const handleRequestCancellation = async () => {
    if (!selectedOrderId || !cancellationReason.trim()) return;
    
    try {
      setIsSubmitting(true);
      await requestOrderCancellation(selectedOrderId, cancellationReason);
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.id === selectedOrderId 
          ? { ...order, status: 'cancel_requested' } 
          : order
      ));
      
      toast({
        title: 'Cancellation requested',
        description: 'Your cancellation request has been submitted and is pending approval.',
      });
      
      setIsCancellationDialogOpen(false);
      setCancellationReason('');
    } catch (error: any) {
      console.error('Error requesting cancellation:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to request cancellation',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!selectedOrderId) return;
    
    try {
      setIsSubmitting(true);
      await confirmOrderDelivery(selectedOrderId, deliveryNotes);
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.id === selectedOrderId 
          ? { ...order, status: 'delivery_confirmed' } 
          : order
      ));
      
      toast({
        title: 'Delivery confirmed',
        description: 'Thank you for confirming your delivery.',
      });
      
      setIsDeliveryDialogOpen(false);
      setDeliveryNotes('');
    } catch (error: any) {
      console.error('Error confirming delivery:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to confirm delivery',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCancellationDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsCancellationDialogOpen(true);
  };

  const openDeliveryDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDeliveryDialogOpen(true);
  };

  const openReviewDialog = (productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName });
    setIsReviewDialogOpen(true);
  };

  const handleReviewSubmitted = () => {
    setIsReviewDialogOpen(false);
    setSelectedProduct(null);
    // Optionally refresh orders data if needed
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-6 w-6 text-amber-500" />;
      case 'processing':
        return <RefreshCw className="h-6 w-6 text-blue-600 animate-spin-slow" />;
      case 'shipped':
        return <Truck className="h-6 w-6 text-violet-600" />;
      case 'delivered':
        return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-rose-500" />;
      case 'cancel_requested':
        return <AlertCircle className="h-6 w-6 text-orange-500" />;
      case 'delivery_confirmed':
        return <ThumbsUp className="h-6 w-6 text-teal-500" />;
      default:
        return <HelpCircle className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200">Cancelled</Badge>;
      case 'cancel_requested':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200">Cancellation Requested</Badge>;
      case 'delivery_confirmed':
        return <Badge className="bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200">Delivery Confirmed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200">{status}</Badge>;
    }
  };

  const canRequestCancellation = (status: string) => {
    return ['pending', 'processing'].includes(status.toLowerCase());
  };

  const canConfirmDelivery = (status: string) => {
    return status.toLowerCase() === 'shipped';
  };

  const canReviewProduct = (orderStatus: string) => {
    return ['delivered', 'delivery_confirmed'].includes(orderStatus.toLowerCase());
  };

  // Add a function to format shipping address
  const formatShippingAddress = (order: Order) => {
    // If we have a shipping_address object with street
    if (typeof order.shipping_address === 'object' && order.shipping_address?.street) {
      return (
        <>
          <p>{order.shipping_address.street}</p>
          <p>
            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
          </p>
        </>
      );
    }
    
    // If we have direct shipping fields
    if (order.shipping_street) {
      return (
        <>
          <p>{order.shipping_street}</p>
          <p>
            {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}
          </p>
        </>
      );
    }
    
    // If we have a string shipping_address (from property getter)
    if (typeof order.shipping_address === 'string' && order.shipping_address.length > 5) {
      // Try to parse the string format "street, city, state zipcode"
      const addressParts = order.shipping_address.split(',');
      if (addressParts.length >= 2) {
        const street = addressParts[0].trim();
        const locationParts = addressParts.slice(1).join(',').trim().split(' ');
        const zipCode = locationParts.pop() || '';
        const state = locationParts.pop() || '';
        const city = locationParts.join(' ');
        
        return (
          <>
            <p>{street}</p>
            <p>{city && state ? `${city}, ${state} ${zipCode}` : order.shipping_address}</p>
          </>
        );
      }
      return <p>{order.shipping_address}</p>;
    }
    
    // Fallback
    return <p>N/A</p>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F0FB] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">My Orders</h2>
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F1F0FB] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">My Orders</h2>
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="text-rose-500 text-xl mb-4">Error: {error}</div>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#F1F0FB] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">My Orders</h2>
          <Card className="bg-white p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <ShoppingBag className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold">No orders found</h3>
              <p className="text-gray-500">You haven't placed any orders yet.</p>
              <Button onClick={() => navigate('/shop')} className="mt-4 bg-[#3b82f6] hover:bg-[#2563eb]">
                Start Shopping
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F0FB] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">My Orders</h2>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="mt-3 md:mt-0 flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </div>
                
                <div className="divide-y">
                  {order.items.map((item) => (
                    <div key={item.product.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full bg-gray-200">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span>₹{typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(String(item.price)).toFixed(2)}</span>
                            <span className="mx-2">×</span>
                            <span>{item.quantity}</span>
                          </div>
                          
                          {/* Add Review Button */}
                          {canReviewProduct(order.status) && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="mt-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 p-0"
                              onClick={() => openReviewDialog(item.product.id, item.product.name)}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Write a Review
                            </Button>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-medium">₹{
                            (() => {
                              try {
                                const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price));
                                return (item.quantity * price).toFixed(2);
                              } catch (e) {
                                console.error('Error calculating item total:', e);
                                return '0.00';
                              }
                            })()
                          }</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="mb-4 md:mb-0">
                      <h4 className="font-medium text-gray-700">Shipping Address</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatShippingAddress(order)}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Total</span>
                      <span className="font-bold text-lg block">₹{
                        (() => {
                          try {
                            return typeof order.total_amount === 'number' 
                              ? order.total_amount.toFixed(2) 
                              : parseFloat(String(order.total_amount)).toFixed(2);
                          } catch (e) {
                            console.error('Error formatting total amount:', e);
                            return '0.00';
                          }
                        })()
                      }</span>
                    </div>
                  </div>
                  
                  {/* Order Actions */}
                  <div className="mt-4 flex justify-end space-x-2">
                    {canRequestCancellation(order.status) && (
                      <Button 
                        variant="outline" 
                        className="border-rose-200 text-rose-600 hover:bg-rose-50"
                        onClick={() => openCancellationDialog(order.id)}
                      >
                        Request Cancellation
                      </Button>
                    )}
                    
                    {canConfirmDelivery(order.status) && (
                      <Button 
                        variant="outline"
                        className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        onClick={() => openDeliveryDialog(order.id)}
                      >
                        Confirm Delivery
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Cancellation Request Dialog */}
      <Dialog open={isCancellationDialogOpen} onOpenChange={setIsCancellationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Order Cancellation</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this order. Your request will be reviewed by our team.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Reason for cancellation"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="min-h-[100px]"
          />
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCancellationDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRequestCancellation}
              disabled={isSubmitting || !cancellationReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delivery Confirmation Dialog */}
      <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Order Delivery</DialogTitle>
            <DialogDescription>
              Please confirm that you have received your order. You can add optional notes about your delivery.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Delivery notes (optional)"
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            className="min-h-[100px]"
          />
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeliveryDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelivery}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Delivery'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Product Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Product</DialogTitle>
            <DialogDescription>
              Share your experience with {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <ProductReviewForm 
              productId={selectedProduct.id}
              productName={selectedProduct.name}
              onReviewSubmitted={handleReviewSubmitted}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders; 