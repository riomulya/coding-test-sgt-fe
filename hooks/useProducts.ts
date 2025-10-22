import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Product, ProductFormData, ApiResponse } from '@/types/product.types';

export const useProducts = () => {
  const { getToken, user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        message.error('Authentication failed');
        return;
      }

      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((currentPage - 1) * pageSize).toString(),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await axios.get<ApiResponse>(`/api/products?${params}`, {
        headers: { authorization: `Bearer ${token}` },
      });

      if (response.data.is_success) {
        const fetchedProducts = response.data.data || [];
        setProducts(fetchedProducts);
        setTotal(response.data.pagination?.total || 0);

        // Calculate statistics
        const uniqueCategories = [
          ...new Set(
            fetchedProducts.map((p) => p.product_category).filter(Boolean)
          ),
        ];
        setCategories(uniqueCategories as string[]);

        const totalProductValue = fetchedProducts.reduce(
          (sum, product) => sum + (product.product_price || 0),
          0
        );
        setTotalValue(totalProductValue);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchTerm, getToken, user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalVisible(true);
  };

  const handleDelete = async (productId: string) => {
    try {
      const token = await getToken();
      const response = await axios.delete(
        `/api/product?product_id=${productId}`,
        {
          headers: token ? { authorization: `Bearer ${token}` } : {},
        }
      );

      if (response.data.is_success) {
        message.success('Product deleted successfully');
        fetchProducts();
      } else {
        message.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product');
    }
  };

  const handleSubmit = async (values: ProductFormData) => {
    try {
      const token = await getToken();
      const headers = token ? { authorization: `Bearer ${token}` } : {};

      if (editingProduct) {
        await axios.put(
          '/api/product',
          { product_id: editingProduct.product_id, ...values },
          { headers }
        );
        message.success('Product updated successfully');
      } else {
        await axios.post('/api/product', values, { headers });
        message.success('Product created successfully');
      }

      setModalVisible(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      message.error('Failed to save product');
    }
  };

  return {
    products,
    loading,
    total,
    currentPage,
    pageSize,
    searchTerm,
    modalVisible,
    editingProduct,
    categories,
    totalValue,
    fetchProducts,
    handleSearch,
    handlePageChange,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSubmit,
    setModalVisible,
  };
};
