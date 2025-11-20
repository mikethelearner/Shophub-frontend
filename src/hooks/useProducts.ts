import { useQuery } from '@tanstack/react-query';
import { getProducts, getProduct } from '@/lib/api';

export const useProducts = (params?: {
  search?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      try {
        console.log('Fetching products with params:', params);
        
        const data = await getProducts();
        console.log('Raw API response:', data);

        // The API now returns an array of products directly
        const products = Array.isArray(data) ? data : [];
        console.log('Processed products array:', products);

        // Transform the response to include default values for missing fields
        const transformedProducts = products.map(product => ({
          ...product,
          _id: product._id || product.id, // Ensure we have _id for frontend use
          imageUrl: product.image_url || product.imageUrl || '',
          rating: product.rating || 4.5,
          price: Number(product.price),
          stock: Number(product.stock || 0),
          category: product.category || 'Uncategorized',
          description: product.description || 'No description available',
        }));

        console.log('Transformed products:', transformedProducts);

        // Filter products based on params if they exist
        let filteredProducts = transformedProducts;
        
        if (params) {
          if (params.search) {
            const searchLower = params.search.toLowerCase();
            filteredProducts = filteredProducts.filter(product =>
              product.name.toLowerCase().includes(searchLower) ||
              (product.description && product.description.toLowerCase().includes(searchLower))
            );
          }
          
          if (params.categories?.length) {
            filteredProducts = filteredProducts.filter(product => {
              // Make category comparison case-insensitive
              const productCategory = product.category.toLowerCase();
              return params.categories.some(category => 
                category.toLowerCase() === productCategory
              );
            });
          }
          
          if (params.minPrice !== undefined && params.minPrice !== null) {
            filteredProducts = filteredProducts.filter(product =>
              product.price >= params.minPrice!
            );
          }
          
          if (params.maxPrice !== undefined && params.maxPrice !== null) {
            filteredProducts = filteredProducts.filter(product =>
              product.price <= params.maxPrice!
            );
          }
        }

        console.log('Filtered products:', filteredProducts);

        return {
          products: filteredProducts,
          totalPages: 1,
          currentPage: 1,
          totalProducts: filteredProducts.length,
        };
      } catch (error) {
        console.error('Error in useProducts hook:', error);
        throw error;
      }
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
}; 