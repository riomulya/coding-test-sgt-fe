import { Product } from '@/types/product.types';

export const calculateProductStatistics = (products: Product[]) => {
  const uniqueCategories = [
    ...new Set(products.map((p) => p.product_category).filter(Boolean)),
  ] as string[];

  const totalValue = products.reduce(
    (sum, product) => sum + (product.product_price || 0),
    0
  );

  const averagePrice =
    products.length > 0 ? Math.round(totalValue / products.length) : 0;

  return {
    categories: uniqueCategories,
    totalValue,
    averagePrice,
  };
};

export const formatPrice = (price: number): string => {
  return `$${price?.toLocaleString() || '0'}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
