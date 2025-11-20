import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { updateOrderStatus as apiUpdateOrderStatus } from '@/lib/api';
import { 
  Clock, RefreshCw, Truck, CheckCircle2, XCircle, 
  AlertCircle, ThumbsUp, HelpCircle 
} from 'lucide-react';

// Define interfaces for type safety
interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  items: OrderItem[];
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  shipping_address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  } | string;
  // Add direct shipping fields as fallback
  shipping_street?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip_code?: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [apiResponse, setApiResponse] = useState<any>(null); // Store raw API response for debugging
  const navigate = useNavigate();

  // Fetch orders when component mounts
  useEffect(() => {
    console.log('AdminOrders component mounted');
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    console.log('Fetching admin orders...');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        setError('Authentication required');
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/orders/admin/', {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      
      console.log('Orders API response status:', response.status);
      console.log('Orders API response data type:', typeof response.data);
      console.log('Orders API response data length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
      
      // Store raw response for debugging
      setApiResponse(response.data);
      
      // Validate response data
      if (!response.data) {
        throw new Error('Empty response from server');
      }
      
      // Handle both array and object responses
      let ordersData: Order[];
      if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (typeof response.data === 'object' && response.data !== null) {
        // If it's an object with results property (common API pattern)
        ordersData = response.data.results || response.data.orders || [];
        
        // If it's just a single order object, wrap it in an array
        if (!Array.isArray(ordersData) && typeof ordersData === 'object') {
          ordersData = [ordersData];
        }
      } else {
        ordersData = [];
      }
      
      console.log('Processed orders data:', ordersData);
      
      // Validate and normalize each order
      const validatedOrders = ordersData.map(order => ({
        id: order.id || '',
        user: {
          id: order.user?.id || '',
          username: order.user?.username || 'Unknown User',
          email: order.user?.email || 'No email'
        },
        items: Array.isArray(order.items) ? order.items.map(item => ({
          id: item.id || '',
          product: {
            id: item.product?.id || '',
            name: item.product?.name || 'Unknown Product',
            price: Number(item.product?.price || 0),
            image_url: item.product?.image_url || ''
          },
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0)
        })) : [],
        total_amount: Number(order.total_amount || 0),
        status: order.status || 'pending',
        created_at: order.created_at || new Date().toISOString(),
        updated_at: order.updated_at || new Date().toISOString(),
        
        // Handle shipping address in different formats
        shipping_address: typeof order.shipping_address === 'object' ? {
          street: order.shipping_address?.street || '',
          city: order.shipping_address?.city || '',
          state: order.shipping_address?.state || '',
          zipCode: order.shipping_address?.zipCode || ''
        } : order.shipping_address || '',
        
        // Store direct shipping fields
        shipping_street: order.shipping_street || '',
        shipping_city: order.shipping_city || '',
        shipping_state: order.shipping_state || '',
        shipping_zip_code: order.shipping_zip_code || ''
      }));
      
      console.log('Setting orders state with', validatedOrders.length, 'orders');
      setOrders(validatedOrders);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log(`Updating order ${orderId} status to ${newStatus}`);
      
      try {
        const token = localStorage.getItem('token');
        
        // Use axios instead of fetch for better error handling
        const response = await axios({
          method: 'PUT',
          url: `http://localhost:8000/api/orders/${orderId}/status/`,
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          data: { status: newStatus }
        });
        
        console.log('Status updated successfully:', response.data);
        
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      } catch (error: any) {
        console.error('Error updating status:', error);
        console.error('Error response:', error.response);
        console.error('Error data:', error.response?.data);
        
        // Show a more specific error message
        if (error.response?.data) {
          alert(`Failed to update order status: ${JSON.stringify(error.response.data)}`);
        } else {
          alert('Failed to update order status. Please check the console for details.');
        }
      }
    } catch (err: any) {
      console.error('Error in updateOrderStatus function:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-violet-100 text-violet-800 border-violet-200',
      delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
      cancel_requested: 'bg-orange-100 text-orange-800 border-orange-200',
      delivery_confirmed: 'bg-teal-100 text-teal-800 border-teal-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  // Add a function to get status icons
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin-slow" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-violet-600" />;
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-rose-500" />;
      case 'cancel_requested':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'delivery_confirmed':
        return <ThumbsUp className="h-5 w-5 text-teal-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Debug view for raw API response
  const renderDebugInfo = () => {
    if (!apiResponse) return null;
    
    return (
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">Debug Information</h3>
        <p>API returned data but component couldn't render it properly.</p>
        <p>Response type: {typeof apiResponse}</p>
        <p>Is array: {Array.isArray(apiResponse) ? 'Yes' : 'No'}</p>
        {typeof apiResponse === 'object' && (
          <div>
            <p>Keys: {Object.keys(apiResponse).join(', ')}</p>
          </div>
        )}
        <button 
          onClick={() => console.log('Full API response:', apiResponse)}
          className="mt-2 px-3 py-1 bg-gray-200 rounded"
        >
          Log Full Response to Console
        </button>
      </div>
    );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F0FB] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Manage Orders</h2>
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F1F0FB] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Manage Orders</h2>
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="text-rose-500 text-xl mb-4">Error: {error}</div>
            <button 
              onClick={fetchOrders}
              className="px-4 py-2 bg-[#3b82f6] text-white rounded-md hover:bg-[#2563eb]"
            >
              Try Again
            </button>
            {renderDebugInfo()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F0FB] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Manage Orders</h2>
        
        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">No orders found.</p>
            {renderDebugInfo()}
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        {getStatusBadge(order.status)}
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="border rounded p-1 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="cancel_requested">Cancellation Requested</option>
                        <option value="delivery_confirmed">Delivery Confirmed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between border-t pt-4">
                    <div>
                      <p className="font-medium">Customer</p>
                      <p>{order.user.username}</p>
                      <p className="text-sm text-gray-500">{order.user.email}</p>
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                      <p className="font-medium">Shipping Address</p>
                      {formatShippingAddress(order)}
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                      <p className="font-medium">Order Total</p>
                      <p className="text-lg font-bold">₹{order.total_amount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleOrderExpand(order.id)}
                    className="mt-4 text-[#3b82f6] hover:text-[#2563eb] text-sm font-medium"
                  >
                    {expandedOrders[order.id] ? 'Hide Details' : 'View Details'}
                  </button>
                  
                  {expandedOrders[order.id] && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium mb-2">Order Items</h4>
                      <div className="space-y-4">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                              {item.product.image_url ? (
                                <img 
                                  src={item.product.image_url} 
                                  alt={item.product.name} 
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="text-gray-400">No image</div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.product.name}</p>
                              <div className="flex justify-between">
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders; 