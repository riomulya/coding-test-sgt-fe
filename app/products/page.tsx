'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  InputNumber,
  message,
  Pagination,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  PictureOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import Image from 'next/image';
import axios from 'axios';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

const { Title } = Typography;
const { TextArea } = Input;

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

export default function ProductsPage() {
  const { logout, getToken, loading: authLoading, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products - hanya jalankan jika user sudah login dan tidak loading
  const fetchProducts = useCallback(async () => {
    if (authLoading || !user) {
      console.log('Auth still loading or user not logged in');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      console.log('Token:', token);

      if (!token) {
        console.error('No token available');
        message.error('Authentication failed');
        return;
      }

      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((currentPage - 1) * pageSize).toString(),
      });

      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }

      console.log('Fetching products with params:', params.toString());
      const response = await axios.get<ApiResponse>(`/api/products?${params}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      console.log('API Response:', response.data);

      if (response.data.is_success) {
        setProducts(response.data.data || []);
        setTotal(response.data.pagination?.total || 0);
      } else {
        message.error('Failed to fetch products');
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchTerm, getToken, authLoading, user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  // Handle create product
  const handleCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Handle edit product
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      product_title: product.product_title,
      product_price: product.product_price,
      product_description: product.product_description,
      product_image: product.product_image,
      product_category: product.product_category,
    });
    setModalVisible(true);
  };

  // Handle delete product
  const handleDelete = async (productId: string) => {
    try {
      const token = await getToken();
      const response = await axios.delete(
        `/api/product?product_id=${productId}`,
        {
          headers: {
            ...(token && { authorization: `Bearer ${token}` }),
          },
        }
      );
      console.log(response.data);
      if (response.data.is_success) {
        message.success('Product deleted successfully');
        fetchProducts(); // Refresh the list
      } else {
        message.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error(`Failed to delete product ${error}`);
    }
  };

  // Handle form submit
  const handleSubmit = async (values: ProductFormData) => {
    try {
      const token = await getToken();
      const headers = {
        ...(token && { authorization: `Bearer ${token}` }),
      };

      if (editingProduct) {
        // Update product
        const response = await axios.put(
          '/api/product',
          {
            product_id: editingProduct.product_id,
            ...values,
          },
          { headers }
        );

        if (response.data.is_success) {
          message.success('Product updated successfully');
          setModalVisible(false);
          fetchProducts();
        } else {
          message.error('Failed to update product');
        }
      } else {
        // Create product
        const response = await axios.post('/api/product', values, { headers });

        if (response.data.is_success) {
          message.success('Product created successfully');
          setModalVisible(false);
          fetchProducts();
        } else {
          message.error('Failed to create product');
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      message.error('Failed to save product');
    }
  };

  // Add logout handler
  const handleLogout = async () => {
    try {
      await logout();
      message.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Logout failed');
    }
  };

  // Table columns
  const columns = [
    {
      title: '#',
      key: 'index',
      width: '5%',
      render: (_, __, index: number) => (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <span
            style={{
              fontWeight: 'bold',
              color: '#1890ff',
              fontSize: '14px',
            }}
          >
            {(currentPage - 1) * pageSize + index + 1}
          </span>
        </motion.div>
      ),
    },
    {
      title: 'Image',
      dataIndex: 'product_image',
      key: 'product_image',
      width: '10%',
      render: (imageUrl: string, record: Product) => {
        // Check if URL is valid before rendering Image component
        const isValidUrl =
          imageUrl &&
          typeof imageUrl === 'string' &&
          (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            {isValidUrl ? (
              <div
                style={{
                  position: 'relative',
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={imageUrl}
                  alt={record.product_title}
                  fill
                  sizes='60px'
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback jika gambar gagal dimuat
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.setAttribute(
                      'style',
                      'display: flex'
                    );
                  }}
                />
                <div
                  style={{
                    display: 'none',
                    width: '100%',
                    height: '100%',
                    background: '#f0f0f0',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                  }}
                >
                  <PictureOutlined
                    style={{ fontSize: '20px', color: '#999' }}
                  />
                </div>
              </div>
            ) : (
              <Avatar
                size={60}
                icon={<PictureOutlined />}
                style={{
                  background: '#f0f0f0',
                  borderRadius: '8px',
                }}
              />
            )}
          </motion.div>
        );
      },
    },
    {
      title: 'Product Title',
      dataIndex: 'product_title',
      key: 'product_title',
      width: '20%',
      render: (text: string) => (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <strong style={{ fontSize: '14px' }}>{text}</strong>
        </motion.div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'product_price',
      key: 'product_price',
      width: '12%',
      render: (price: number) => (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span
            style={{
              fontWeight: 'bold',
              color: '#52c41a',
              fontSize: '14px',
              background: '#f6ffed',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #b7eb8f',
            }}
          >
            ${price?.toLocaleString() || '0'}
          </span>
        </motion.div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'product_category',
      key: 'product_category',
      width: '12%',
      render: (category: string) => (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: '#e6f7ff',
            color: '#1890ff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            border: '1px solid #91d5ff',
          }}
        >
          {category || 'N/A'}
        </motion.span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'product_description',
      key: 'product_description',
      width: '20%',
      render: (description: string) => (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {description ? (
            <span
              title={description}
              style={{ fontSize: '13px', lineHeight: '1.4' }}
            >
              {description.length > 50
                ? `${description.substring(0, 50)}...`
                : description}
            </span>
          ) : (
            <span style={{ color: '#999', fontSize: '13px' }}>
              No description
            </span>
          )}
        </motion.div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '16%',
      render: (_, record: Product) => (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Space direction='vertical' size='small'>
            <Button
              type='primary'
              size='small'
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ width: '100%' }}
            >
              Edit
            </Button>
            <Popconfirm
              title='Are you sure you want to delete this product?'
              onConfirm={() => handleDelete(record.product_id.trim())}
              okText='Yes'
              cancelText='No'
            >
              <Button
                type='primary'
                danger
                size='small'
                icon={<DeleteOutlined />}
                style={{ width: '100%' }}
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        </motion.div>
      ),
    },
  ];

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size='large' />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ padding: '24px', minHeight: '100vh', background: '#f5f5f5' }}
      >
        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <Row
            justify='space-between'
            align='middle'
            style={{ marginBottom: 24 }}
          >
            <Col xs={24} sm={12}>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                Product Management
              </Title>
              <p
                style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}
              >
                Total: {total} products
              </p>
            </Col>
            <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
              <Space wrap>
                <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>
                  Logout
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchProducts}
                  loading={loading}
                >
                  Refresh
                </Button>
                <Button
                  type='primary'
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                  size='large'
                >
                  Create Product
                </Button>
              </Space>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder='Search products...'
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
                size='large'
              />
            </Col>
          </Row>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Table
              columns={columns}
              dataSource={products}
              rowKey='product_id'
              loading={loading}
              pagination={false}
              scroll={{ x: 1000 }}
              size='middle'
              style={{ borderRadius: '8px' }}
            />
          </motion.div>

          {total > 0 && (
            <Row justify='center' style={{ marginTop: 24 }}>
              <Col>
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  onShowSizeChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) =>
                    `Showing ${range[0]}-${range[1]} of ${total} products`
                  }
                />
              </Col>
            </Row>
          )}
        </Card>

        <Modal
          title={editingProduct ? 'Edit Product' : 'Create Product'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
          destroyOnHidden={true}
          style={{ borderRadius: '12px' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Form
              form={form}
              layout='vertical'
              onFinish={handleSubmit}
              autoComplete='off'
            >
              <Form.Item
                name='product_title'
                label='Product Title'
                rules={[
                  { required: true, message: 'Please input product title!' },
                  { min: 3, message: 'Title must be at least 3 characters!' },
                ]}
              >
                <Input placeholder='Enter product title' size='large' />
              </Form.Item>

              <Form.Item
                name='product_price'
                label='Price'
                rules={[
                  { required: true, message: 'Please input product price!' },
                  {
                    type: 'number',
                    min: 0,
                    message: 'Price must be positive!',
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder='Enter product price'
                  min={0}
                  size='large'
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  // parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item name='product_description' label='Description'>
                <TextArea
                  rows={4}
                  placeholder='Enter product description'
                  maxLength={500}
                  showCount
                  size='large'
                />
              </Form.Item>

              <Form.Item name='product_category' label='Category'>
                <Input placeholder='Enter product category' size='large' />
              </Form.Item>

              <Form.Item
                name='product_image'
                label='Image URL'
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.resolve(); // Optional field
                      }

                      // Simple URL validation
                      if (
                        !value.startsWith('http://') &&
                        !value.startsWith('https://')
                      ) {
                        return Promise.reject(
                          new Error(
                            'Please enter a valid URL starting with http:// or https://'
                          )
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  placeholder='Enter image URL (e.g., https://example.com/image.jpg)'
                  size='large'
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setModalVisible(false)} size='large'>
                    Cancel
                  </Button>
                  <Button type='primary' htmlType='submit' size='large'>
                    {editingProduct ? 'Update' : 'Create'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </motion.div>
        </Modal>
      </motion.div>
    </ProtectedRoute>
  );
}
