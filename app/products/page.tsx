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
  Statistic,
  Tag,
  Tooltip,
  Badge,
  Drawer,
  FloatButton,
  Affix,
  Grid,
} from 'antd';

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  PictureOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TagsOutlined,
  EyeOutlined,
  FilterOutlined,
  MenuOutlined,
  CloseOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import Image from 'next/image';
import axios from 'axios';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
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
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalValue, setTotalValue] = useState(0);

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
      render: (_: any, __: any, index: number) => (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <Button
            type='link'
            onClick={() =>
              router.push(`/products/${products[index]?.product_id}`)
            }
            style={{
              fontWeight: 'bold',
              color: '#1890ff',
              fontSize: '14px',
              padding: 0,
              height: 'auto',
            }}
          >
            {(currentPage - 1) * pageSize + index + 1}
          </Button>
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
      render: (_: any, record: Product) => (
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

  //  Statistics Cards
  const StatCard = ({ title, value, icon, color, prefix }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card
        style={{
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${color}15, ${color}05)`,
          border: `1px solid ${color}30`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <Row align='middle' gutter={16}>
          <Col>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${color}, ${color}CC)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'white',
              }}
            >
              {icon}
            </div>
          </Col>
          <Col flex={1}>
            <Statistic
              title={title}
              value={value}
              prefix={prefix}
              valueStyle={{ color, fontSize: '24px', fontWeight: 'bold' }}
              // titleStyle={{ color: '#666', fontSize: '14px' }}
            />
          </Col>
        </Row>
      </Card>
    </motion.div>
  );

  // Grid View Component
  const ProductGrid = () => (
    <Row gutter={[24, 24]}>
      {products.map((product, index) => (
        <Col xs={24} sm={12} md={8} lg={6} key={product.product_id}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <Card
              hoverable
              style={{
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                height: '100%',
              }}
              cover={
                <div style={{ height: '200px', position: 'relative' }}>
                  {product.product_image &&
                  product.product_image.startsWith('http') ? (
                    <Image
                      src={product.product_image}
                      alt={product.product_title}
                      fill
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.setAttribute(
                          'style',
                          'display: flex'
                        );
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      display: product.product_image?.startsWith('http')
                        ? 'none'
                        : 'flex',
                      width: '100%',
                      height: '100%',
                      background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '48px',
                    }}
                  >
                    <ShoppingCartOutlined />
                  </div>
                </div>
              }
              actions={[
                <Tooltip title='View Details'>
                  <EyeOutlined
                    key='view'
                    onClick={() =>
                      router.push(`/products/${product.product_id}`)
                    }
                  />
                </Tooltip>,
                <Tooltip title='Edit'>
                  <EditOutlined
                    key='edit'
                    onClick={() => handleEdit(product)}
                  />
                </Tooltip>,
                <Tooltip title='Delete'>
                  <Popconfirm
                    title='Delete this product?'
                    onConfirm={() => handleDelete(product.product_id.trim())}
                    okText='Yes'
                    cancelText='No'
                  >
                    <DeleteOutlined key='delete' />
                  </Popconfirm>
                </Tooltip>,
              ]}
            >
              <Card.Meta
                title={
                  <Text strong style={{ fontSize: '16px' }}>
                    {product.product_title}
                  </Text>
                }
                description={
                  <div>
                    <div style={{ marginBottom: '8px' }}>
                      <Text
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#52c41a',
                        }}
                      >
                        ${product.product_price?.toLocaleString() || '0'}
                      </Text>
                    </div>
                    {product.product_category && (
                      <Tag color='blue' style={{ marginBottom: '8px' }}>
                        {product.product_category}
                      </Tag>
                    )}
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {product.product_description?.substring(0, 60)}...
                    </div>
                  </div>
                }
              />
            </Card>
          </motion.div>
        </Col>
      ))}
    </Row>
  );

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Spin size='large' style={{ color: 'white' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '24px',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <Row justify='space-between' align='middle'>
            <Col xs={18} sm={20} md={12}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Title
                  level={1}
                  style={{
                    margin: 0,
                    color: 'white',
                    fontSize: screens.xs ? '20px' : '32px',
                  }}
                >
                  🛍️ Product Management
                </Title>
                {!screens.xs && (
                  <>
                    <Text
                      style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '16px',
                      }}
                    >
                      Manage your products with style and efficiency
                    </Text>
                    {user && (
                      <div style={{ marginTop: '8px' }}>
                        <Text
                          style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '14px',
                          }}
                        >
                          Welcome back, {user.displayName || user.email} 👋
                        </Text>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </Col>
            <Col xs={6} sm={4} md={12} style={{ textAlign: 'right' }}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Space wrap>
                  <Button
                    icon={<MenuOutlined />}
                    onClick={() => setDrawerVisible(true)}
                    style={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                    ghost
                    size={screens.xs ? 'small' : 'middle'}
                  >
                    {!screens.xs && 'Menu'}
                  </Button>
                  <Button
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    danger
                    ghost
                    size={screens.xs ? 'small' : 'middle'}
                  >
                    {!screens.xs && 'Logout'}
                  </Button>
                </Space>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* Main Content */}
        <div style={{ padding: screens.xs ? '16px' : '32px 24px' }}>
          {/* Statistics Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title='Total Products'
                value={total}
                icon={<ShoppingCartOutlined />}
                color='#1890ff'
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title='Categories'
                value={categories.length}
                icon={<TagsOutlined />}
                color='#52c41a'
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title='Total Value'
                value={totalValue}
                icon={<DollarOutlined />}
                color='#faad14'
                prefix='$'
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title='Avg. Price'
                value={total > 0 ? Math.round(totalValue / total) : 0}
                icon={<DollarOutlined />}
                color='#f5222d'
                prefix='$'
              />
            </Col>
          </Row>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card
              style={{
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                marginBottom: '24px',
              }}
            >
              <Row gutter={[16, 16]} align='middle'>
                <Col xs={24} sm={12} md={8}>
                  <Input
                    placeholder='🔍 Search products...'
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    allowClear
                    size='large'
                    style={{ borderRadius: '12px' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Space>
                    <Button
                      type={viewMode === 'table' ? 'primary' : 'default'}
                      icon={<UnorderedListOutlined />}
                      onClick={() => setViewMode('table')}
                      size={screens.xs ? 'middle' : 'large'}
                    >
                      {!screens.xs && 'Table'}
                    </Button>
                    <Button
                      type={viewMode === 'grid' ? 'primary' : 'default'}
                      icon={<AppstoreOutlined />}
                      onClick={() => setViewMode('grid')}
                      size={screens.xs ? 'middle' : 'large'}
                    >
                      {!screens.xs && 'Grid'}
                    </Button>
                  </Space>
                </Col>
                <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
                  <Space>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchProducts}
                      loading={loading}
                      size={screens.xs ? 'middle' : 'large'}
                    >
                      {!screens.xs && 'Refresh'}
                    </Button>
                    <Button
                      type='primary'
                      icon={<PlusOutlined />}
                      onClick={handleCreate}
                      size={screens.xs ? 'middle' : 'large'}
                      style={{ borderRadius: '12px' }}
                    >
                      {!screens.xs && 'Add Product'}
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {viewMode === 'table' ? (
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}
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
              </Card>
            ) : (
              <ProductGrid />
            )}
          </motion.div>

          {/* Pagination */}
          {total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Row justify='center' style={{ marginTop: '32px' }}>
                <Col>
                  <Card
                    style={{
                      borderRadius: '16px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }}
                  >
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
                  </Card>
                </Col>
              </Row>
            </motion.div>
          )}
        </div>

        {/* Floating Action Button */}
        <FloatButton
          icon={<PlusOutlined />}
          type='primary'
          style={{ right: 24, bottom: 24 }}
          onClick={handleCreate}
          tooltip='Add New Product'
        />

        {/* Mobile Drawer */}
        <Drawer
          title='Menu'
          placement='right'
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={280}
        >
          <Space direction='vertical' size='large' style={{ width: '100%' }}>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => {
                handleCreate();
                setDrawerVisible(false);
              }}
              block
              size='large'
            >
              Add Product
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchProducts();
                setDrawerVisible(false);
              }}
              loading={loading}
              block
              size='large'
            >
              Refresh
            </Button>
            <Button
              icon={<LogoutOutlined />}
              onClick={() => {
                handleLogout();
                setDrawerVisible(false);
              }}
              danger
              block
              size='large'
            >
              Logout
            </Button>
          </Space>
        </Drawer>

        {/* Product Modal */}
        <Modal
          title={
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                {editingProduct ? '✏️ Edit Product' : '➕ Create Product'}
              </Title>
            </div>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
          destroyOnClose={true}
          style={{ borderRadius: '16px' }}
          styles={{
            body: { padding: '24px' },
            header: { borderBottom: 'none' },
          }}
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
              size='large'
            >
              <Form.Item
                name='product_title'
                label='Product Title'
                rules={[
                  { required: true, message: 'Please input product title!' },
                  { min: 3, message: 'Title must be at least 3 characters!' },
                ]}
                style={{ marginBottom: '20px' }}
              >
                <Input
                  placeholder='Enter product title'
                  style={{ borderRadius: '12px' }}
                />
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
                style={{ marginBottom: '20px' }}
              >
                <InputNumber
                  style={{ width: '100%', borderRadius: '12px' }}
                  placeholder='Enter product price'
                  min={0}
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                />
              </Form.Item>

              <Form.Item
                name='product_description'
                label='Description'
                style={{ marginBottom: '20px' }}
              >
                <TextArea
                  rows={3}
                  placeholder='Enter product description'
                  maxLength={500}
                  showCount
                  style={{ borderRadius: '12px' }}
                />
              </Form.Item>

              <Form.Item
                name='product_category'
                label='Category'
                style={{ marginBottom: '20px' }}
              >
                <Input
                  placeholder='Enter product category'
                  style={{ borderRadius: '12px' }}
                />
              </Form.Item>

              <Form.Item
                name='product_image'
                label='Image URL'
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.resolve();
                      }

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
                style={{ marginBottom: '32px' }}
              >
                <Input
                  placeholder='Enter image URL (e.g., https://example.com/image.jpg)'
                  style={{ borderRadius: '12px' }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space size='middle'>
                  <Button
                    onClick={() => setModalVisible(false)}
                    size='large'
                    style={{ borderRadius: '12px' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='primary'
                    htmlType='submit'
                    size='large'
                    style={{ borderRadius: '12px' }}
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </motion.div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
