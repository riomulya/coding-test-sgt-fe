interface Product {
  product_id: string;
  product_title: string;
  product_price: number;
  product_description?: string;
  product_image?: string;
  product_category?: string;
  created_timestamp: string;
  updated_timestamp: string;
}

interface ProductFormData {
  product_title: string;
  product_price: number;
  product_description?: string;
  product_image?: string;
  product_category?: string;
}

// Update interface berdasarkan response yang sebenarnya
interface ApiResponse {
  status_code: string;
  is_success: boolean;
  error_code?: string;
  data: Product[]; // Data langsung sebagai array
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    search?: string;
  };
}

export type { Product, ProductFormData, ApiResponse };