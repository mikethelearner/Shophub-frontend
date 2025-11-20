import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/hooks/useCart';
import useAuth from '@/hooks/useAuth';
import { createOrder } from '@/lib/api';
import { ShoppingBag, CreditCard, Truck } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    shipping_street: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip_code: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Redirect to cart if cart is empty
  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to generate WhatsApp URL with order details
  const generateWhatsAppURL = (orderId: string, orderItems: any[], total: number) => {
    const phoneNumber = '919790225832'; // WhatsApp business number (without + or spaces)
    
    // Create order items list
    const itemsList = orderItems.map(item => 
      `${item.quantity}x ${item.name} - ₹${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    // Create the message
    const message = `Hello! I've just placed an order on E-MobileSpare.

*Order ID:* ${orderId}

*Order Items:*
${itemsList}

*Total Amount:* ₹${total.toFixed(2)}

*Shipping Address:*
${shippingInfo.shipping_street}
${shippingInfo.shipping_city}, ${shippingInfo.shipping_state} - ${shippingInfo.shipping_zip_code}

*Payment Method:* ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}

Thank you!`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Return WhatsApp URL
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const requiredFields = ['shipping_street', 'shipping_city', 'shipping_state', 'shipping_zip_code'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field as keyof typeof shippingInfo]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Debug: Log the cart structure
      console.log('Cart structure before order creation:', cart);
      
      // Create order data
      const orderData = {
        ...shippingInfo,
        payment_method: paymentMethod,
      };
      
      console.log('Creating order with data:', orderData);
      
      // Call API to create order
      const response = await createOrder(orderData);
      console.log('Order created:', response);
      
      // Generate WhatsApp URL with order details
      const whatsappURL = generateWhatsAppURL(
        response.order_id || response.id || 'N/A',
        cart,
        totalPrice
      );
      
      // Explicitly clear the cart after successful order
      clearCart();
      
      // Show success message
      toast({
        title: 'Order placed successfully',
        description: 'Redirecting to WhatsApp...',
      });
      
      // Redirect to WhatsApp after a short delay
      setTimeout(() => {
        window.open(whatsappURL, '_blank');
        // Navigate to orders page after opening WhatsApp
        navigate('/orders');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      
      // Debug: Log the error response
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F0FB] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping and Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="bg-white mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="shipping_street">Street Address</Label>
                      <Input
                        id="shipping_street"
                        name="shipping_street"
                        value={shippingInfo.shipping_street}
                        onChange={handleInputChange}
                        placeholder="123 Main St"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shipping_city">City</Label>
                        <Input
                          id="shipping_city"
                          name="shipping_city"
                          value={shippingInfo.shipping_city}
                          onChange={handleInputChange}
                          placeholder="City"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shipping_state">State</Label>
                        <Input
                          id="shipping_state"
                          name="shipping_state"
                          value={shippingInfo.shipping_state}
                          onChange={handleInputChange}
                          placeholder="State"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="shipping_zip_code">ZIP Code</Label>
                      <Input
                        id="shipping_zip_code"
                        name="shipping_zip_code"
                        value={shippingInfo.shipping_zip_code}
                        onChange={handleInputChange}
                        placeholder="ZIP Code"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="cod"
                        name="payment_method"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="h-4 w-4 text-[#3b82f6] focus:ring-[#3b82f6]"
                      />
                      <Label htmlFor="cod">Cash on Delivery</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="card"
                        name="payment_method"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="h-4 w-4 text-[#3b82f6] focus:ring-[#3b82f6]"
                      />
                      <Label htmlFor="card">Credit/Debit Card</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/cart')}
                >
                  Back to Cart
                </Button>
                <Button
                  type="submit"
                  className="bg-[#3b82f6] hover:bg-[#2563eb]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Place Order'}
                </Button>
              </div>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex items-center">
                        <span className="font-medium">{item.quantity}x</span>
                        <span className="ml-2 truncate">{item.name}</span>
                      </div>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 