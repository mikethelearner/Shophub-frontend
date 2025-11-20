import axios from 'axios';

// Use environment variable if available, otherwise fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
      console.log('Added Authorization header with Token format');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
);

// Auth APIs
export const login = async (email: string, password: string) => {
  const response = await api.post('/users/login/', { email, password });
  return response.data;
};

export const register = async (userData: any) => {
  const response = await api.post('/users/register/', userData);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/users/profile/');
  return response.data;
};

// Product APIs
export const getProducts = async (queryParams?: string) => {
  try {
    console.log('Fetching products...');
    
    // Add timestamp to bypass cache if not provided in queryParams
    const timestamp = new Date().getTime();
    const query = queryParams || `?t=${timestamp}`;
    
    // Make sure query starts with ? if it doesn't already
    const formattedQuery = query.startsWith('?') ? query : `?${query}`;
    
    // Use the list endpoint for getting all products
    const url = `/products/list${formattedQuery}`;
    console.log(`Making GET request to: ${url}`);
    
    const response = await api.get(url);
    
    console.log('Products response:', response);
    
    if (!response.data) {
      console.error('Empty response data from getProducts');
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

export const getProduct = async (id: string) => {
  try {
    console.log(`Fetching product with id: ${id}`);
    
    // Use the detail endpoint for getting a specific product
    const response = await api.get(`/products/detail/${id}/`);
    
    console.log('Product detail response:', response);
    
    if (!response.data) {
      console.error(`Empty response data for product ${id}`);
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

// Order APIs
export const createOrder = async (orderData: any) => {
  // Get cart items from localStorage
  const cart = getCart();
  
  // Debug: Log the raw cart from localStorage
  console.log('Raw cart from localStorage:', cart);
  
  // Add cart items to order data
  const orderWithCart = {
    ...orderData,
    cart_items: cart.map((item: any) => {
      console.log('Processing cart item:', item);
      // Convert price to string to avoid decimal type issues in MongoDB
      return {
        id: item.id,
        name: item.name,
        price: String(item.price), // Convert to string to avoid decimal type issues
        quantity: Number(item.quantity)
      };
    })
  };
  
  console.log('Creating order with data:', orderWithCart);
  
  try {
    const response = await api.post('/orders/create/', orderWithCart);
    
    // Clear cart after successful order
    if (response.status === 201) {
      console.log('Order created successfully, clearing cart');
      localStorage.removeItem('cart');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

export const getUserOrders = async () => {
  const response = await api.get('/orders/my-orders/');
  return response.data;
};

export const getOrder = async (id: string) => {
  const response = await api.get(`/orders/my-orders/${id}/`);
  return response.data;
};

// Add the updateOrderStatus function
export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await api.put(`/orders/${orderId}/status/`, { status });
  return response.data;
};

// New order action APIs
export const requestOrderCancellation = async (orderId: string, reason: string) => {
  const response = await api.put(`/orders/${orderId}/request-cancellation/`, {
    cancellation_reason: reason
  });
  return response.data;
};

export const confirmOrderDelivery = async (orderId: string, notes?: string) => {
  const response = await api.put(`/orders/${orderId}/confirm-delivery/`, {
    delivery_notes: notes || ''
  });
  return response.data;
};

// Admin order APIs
export const getAdminOrders = async (statusFilter?: string) => {
  try {
    const url = statusFilter 
      ? `/orders/admin/?status=${statusFilter}`
      : '/orders/admin/';
    console.log('Fetching admin orders from:', url);
    
    const response = await api.get(url);
    console.log('Admin orders response:', response);
    
    if (!response.data) {
      console.error('Empty response data from getAdminOrders');
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

export const getPendingCancellations = async () => {
  const response = await api.get('/orders/admin/pending-cancellations/');
  return response.data;
};

export const getPendingDeliveryConfirmations = async () => {
  const response = await api.get('/orders/admin/pending-deliveries/');
  return response.data;
};

export const respondToCancellation = async (orderId: string, approve: boolean) => {
  const response = await api.put(`/orders/${orderId}/respond-cancellation/`, { approve });
  return response.data;
};

export const markOrderDelivered = async (orderId: string) => {
  const response = await api.put(`/orders/${orderId}/mark-delivered/`, {});
  return response.data;
};

// Cart functions (using localStorage)
export const getCart = () => {
  const cart = localStorage.getItem('cart');
  console.log('Raw cart from localStorage:', cart);
  
  if (!cart) return [];
  
  try {
    const parsedCart = JSON.parse(cart);
    console.log('Parsed cart:', parsedCart);
    
    // Transform the cart items if they have a nested product structure
    const transformedCart = parsedCart.map((item: any) => {
      if (item.product) {
        // If the item has a nested product structure, flatten it
        return {
          id: item.product._id || item.product.id,
          name: item.product.name,
          price: Number(item.product.price),
          quantity: Number(item.quantity),
          image: item.product.imageUrl || item.product.image,
          description: item.product.description
        };
      }
      // If the item is already flat, return it as is
      return {
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity)
      };
    });
    
    console.log('Transformed cart:', transformedCart);
    return transformedCart;
  } catch (error) {
    console.error('Error parsing cart:', error);
    return [];
  }
};

export const addToCart = (product: any) => {
  const cart = getCart();
  console.log('Current cart before adding:', cart);
  console.log('Adding product:', product);
  
  // Create a flattened product object
  const productToAdd = {
    id: product._id || product.id,
    name: product.name,
    price: Number(product.price),
    image: product.imageUrl || product.image,
    description: product.description || '',
    category: product.category || ''
  };
  
  console.log('Flattened product to add:', productToAdd);
  
  // Check if product already exists in cart
  const existingItemIndex = cart.findIndex((item: any) => 
    item.id === productToAdd.id
  );

  let updatedCart;
  if (existingItemIndex !== -1) {
    // If product exists, update quantity
    updatedCart = [...cart];
    updatedCart[existingItemIndex].quantity += 1;
    console.log('Updated existing item quantity:', updatedCart[existingItemIndex]);
  } else {
    // If product doesn't exist, add it to cart
    updatedCart = [...cart, { ...productToAdd, quantity: 1 }];
    console.log('Added new item to cart:', productToAdd);
  }

  console.log('Updated cart after adding:', updatedCart);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  return updatedCart;
};

export const updateCartItem = (productId: string, quantity: number) => {
  const cart = getCart();
  console.log('Updating cart item:', { productId, quantity });
  
  // Ensure quantity is a number
  const numericQuantity = Number(quantity);
  
  if (isNaN(numericQuantity) || numericQuantity < 1) {
    console.error('Invalid quantity:', quantity);
    return cart;
  }
  
  const updatedCart = cart.map((item: any) => {
    if (item.id === productId) {
      console.log(`Updating item ${item.name} quantity from ${item.quantity} to ${numericQuantity}`);
      return { ...item, quantity: numericQuantity };
    }
    return item;
  });

  console.log('Updated cart after quantity change:', updatedCart);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  return updatedCart;
};

export const removeFromCart = (productId: string) => {
  const cart = getCart();
  console.log('Removing item from cart:', productId);
  
  const itemToRemove = cart.find((item: any) => item.id === productId);
  if (itemToRemove) {
    console.log('Found item to remove:', itemToRemove);
  } else {
    console.log('Item not found in cart');
  }
  
  const updatedCart = cart.filter((item: any) => item.id !== productId);

  console.log('Updated cart after removal:', updatedCart);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  return updatedCart;
};

export const clearCart = () => {
  localStorage.removeItem('cart');
  return [];
};

// Product Management APIs
export const createProduct = async (formData: FormData) => {
  try {
    console.log('Creating product with form data:', Object.fromEntries(formData.entries()));
    
    // Check if there's an image in the form data
    const hasImage = formData.has('image') && formData.get('image') instanceof File;
    
    // Create a copy of the form data without the image for the initial request
    const productData = new FormData();
    for (const [key, value] of formData.entries()) {
      if (key !== 'image') {
        productData.append(key, value);
      }
    }
    
    // First create the product without the image
    const response = await api.post('/products/products/', productData);
    console.log('Product created successfully:', response.data);
    
    // If there's an image and the product was created successfully, upload the image
    if (hasImage && response.data && response.data.id) {
      const productId = response.data.id;
      const imageFormData = new FormData();
      imageFormData.append('image', formData.get('image') as File);
      
      console.log(`Uploading image for product ${productId}`);
      
      const imageResponse = await api.patch(`/products/products/${productId}/`, imageFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Image upload response:', imageResponse);
      return imageResponse.data; // Return the final product with image
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

export const updateProduct = async (id: string, formData: FormData) => {
  try {
    console.log(`Updating product ${id} with form data:`, Object.fromEntries(formData.entries()));
    
    // Check if there's an image in the form data
    const hasImage = formData.has('image') && formData.get('image') instanceof File;
    
    // Create a copy of the form data without the image for the initial request
    const productData = new FormData();
    for (const [key, value] of formData.entries()) {
      if (key !== 'image') {
        productData.append(key, value);
      }
    }
    
    // Log the request URL for debugging
    const url = `/products/products/${id}/update-product/`;
    console.log(`Making POST request to: ${url}`);
    
    // First update the product data without the image
    const response = await api.post(url, productData);
    
    console.log('Product update response:', response);
    
    // If there's an image, upload it separately
    if (hasImage) {
      const imageFormData = new FormData();
      imageFormData.append('image', formData.get('image') as File);
      
      console.log('Uploading image separately');
      
      const imageResponse = await api.patch(`/products/products/${id}/`, imageFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Image upload response:', imageResponse);
      return imageResponse.data; // Return the final product with image
    }
    
    // Force a refresh of the product list
    await getProducts(`?t=${new Date().getTime()}`);
    
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    console.log(`Deleting product ${id}`);
    
    const response = await api.delete(`/products/products/${id}/`, {
      headers: {
        'Content-Type': 'application/json'
        // Authorization header will be added by the interceptor
      }
    });
    
    console.log('Product deletion response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

// Product Reviews
export const createProductReview = async (productId: string, rating: number, comment: string) => {
  try {
    console.log(`Creating review for product ${productId} with rating ${rating} and comment: ${comment}`);
    
    // Validate productId
    if (!productId || productId === 'undefined') {
      console.error('Invalid productId provided to createProductReview:', productId);
      throw new Error('Invalid product ID');
    }
    
    // Clean the productId - ensure it's a string and trim any whitespace
    const cleanProductId = String(productId).trim();
    console.log(`Using cleaned productId: ${cleanProductId}`);
    
    const response = await api.post(`/products/${cleanProductId}/reviews/create/`, {
      rating,
      comment
    });
    
    console.log('Review creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error creating review for product ${productId}:`, error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

export const getProductReviews = async (productId: string) => {
  try {
    console.log(`Fetching reviews for product ${productId}`);
    
    // Validate productId
    if (!productId || productId === 'undefined') {
      console.error('Invalid productId provided to getProductReviews:', productId);
      throw new Error('Invalid product ID');
    }
    
    // Clean the productId - ensure it's a string and trim any whitespace
    const cleanProductId = String(productId).trim();
    console.log(`Using cleaned productId: ${cleanProductId}`);
    
    const response = await api.get(`/products/${cleanProductId}/reviews/`);
    
    console.log('Reviews response:', response);
    
    // Ensure we have a valid response with data
    if (!response.data) {
      console.warn('Empty response data for reviews');
      return [];
    }
    
    // Ensure the response is an array
    if (!Array.isArray(response.data)) {
      console.warn('Response data is not an array:', response.data);
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
}; 