import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Debug: Log the cart structure
  console.log('Cart structure in Cart component:', cart);

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === "discount10") {
      setDiscount(totalPrice * 0.1);
      toast({
        title: "Coupon applied",
        description: "10% discount has been applied to your order.",
      });
    } else if (couponCode.toLowerCase() === "welcome20") {
      setDiscount(totalPrice * 0.2);
      toast({
        title: "Coupon applied",
        description: "20% discount has been applied to your order.",
      });
    } else {
      toast({
        title: "Invalid coupon",
        description: "The coupon code you entered is invalid or expired.",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = () => {
    // Navigate to checkout page instead of simulating checkout
    navigate("/checkout");
  };

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-[#F1F0FB] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Your Cart</h2>
          <Card className="bg-white p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <ShoppingBag className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold">Your cart is empty</h3>
              <p className="text-gray-500">Looks like you haven't added any products to your cart yet.</p>
              <Link to="/shop">
                <Button className="mt-4 bg-[#3b82f6] hover:bg-[#2563eb]">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F0FB] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Your Cart</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="bg-white overflow-hidden">
              <CardContent className="p-0">
                {cart.map((item) => (
                  <div key={item.id} className="p-4 border-b last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md p-2 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {item.description}
                        </p>
                        <div className="mt-1 flex items-center">
                          <span className="font-medium">₹{item.price.toFixed(2)}</span>
                          <span className="mx-2 text-gray-400">×</span>
                          <span>{item.quantity}</span>
                          <span className="ml-auto font-semibold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end space-x-2">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{(totalPrice - discount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleApplyCoupon}
                      className="whitespace-nowrap border-[#3b82f6] text-[#3b82f6]"
                    >
                      Apply
                    </Button>
                  </div>
                  <Button 
                    className="w-full bg-[#3b82f6] hover:bg-[#2563eb]"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                  <Link to="/shop">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
