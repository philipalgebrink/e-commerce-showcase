import type { Product } from '~/types/product';

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch('http://localhost:3001/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};