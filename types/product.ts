export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  type: string;
  variantId: string;
  variants: { id: string; name: string }[];
}