'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Spin,
  message,
  Space,
  Tag,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  DollarOutlined,
  TagOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import Image from 'next/image';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const { Title, Text, Paragraph } = Typography;

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

interface ApiResponse {
  status_code: string;
  is_success: boolean;
  error_code?: string;
  data: Product;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const productId = params.id as string;

  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  const fetchProductDetail = async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        message.error('Authentication failed');
        router.push('/login');
        return;
      }

      const response = await axios.get<ApiResponse>(
        `/api/product?product_id=${productId}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.is_success) {
        setProduct(response.data.data);
      } else {
        message.error('Failed to fetch product details');
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      message.error('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/products/${productId}/edit`);
  };

  const handleDelete = async () => {
    try {
      const token = await getToken();
      if (!token) {
        message.error('Authentication failed');
        return;
      }

      const response = await axios.delete(
        `/api/product?product_id=${productId}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.is_success) {
        message.success('Product deleted successfully');
        router.push('/products');
      } else {
        message.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product');
    }
  };

  const isValidImageUrl = (url: string) => {
    return (
      url &&
      typeof url === 'string' &&
      (url.startsWith('http://') || url.startsWith('https://'))
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
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

  if (!product) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
        }}
      >
        <Title level={3}>Product not found</Title>
        <Button type='primary' onClick={() => router.push('/products')}>
          Back to Products
        </Button>
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
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            marginBottom: '24px',
          }}
        >
          <Row
            justify='space-between'
            align='middle'
            style={{ marginBottom: '24px' }}
          >
            <Col>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/products')}
                style={{ marginBottom: '16px' }}
              >
                Back to Products
              </Button>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                Product Details
              </Title>
            </Col>
            <Col>
              <Space>
                <Button
                  type='primary'
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  size='large'
                >
                  Edit Product
                </Button>
                <Button
                  type='primary'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  size='large'
                >
                  Delete Product
                </Button>
              </Space>
            </Col>
          </Row>

          <Row gutter={[32, 32]}>
            {/* Product Image */}
            <Col xs={24} lg={8}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    textAlign: 'center',
                  }}
                >
                  {isValidImageUrl(product.product_image) ? (
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '300px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        src={product.product_image!}
                        alt={product.product_title}
                        fill
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
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
                        <Text type='secondary'>Image not available</Text>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '300px',
                        background: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                      }}
                    >
                      <Text type='secondary'>No image available</Text>
                    </div>
                  )}
                </Card>
              </motion.div>
            </Col>

            {/* Product Information */}
            <Col xs={24} lg={16}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card style={{ borderRadius: '12px' }}>
                  <Title
                    level={1}
                    style={{ marginBottom: '16px', color: '#1890ff' }}
                  >
                    {product.product_title}
                  </Title>

                  <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={12}>
                      <Space>
                        <DollarOutlined style={{ color: '#52c41a' }} />
                        <Text
                          strong
                          style={{ fontSize: '18px', color: '#52c41a' }}
                        >
                          ${product.product_price?.toLocaleString() || '0'}
                        </Text>
                      </Space>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Space>
                        <TagOutlined style={{ color: '#1890ff' }} />
                        <Tag color='blue' style={{ fontSize: '14px' }}>
                          {product.product_category || 'No Category'}
                        </Tag>
                      </Space>
                    </Col>
                  </Row>

                  <Divider />

                  <div style={{ marginBottom: '24px' }}>
                    <Space style={{ marginBottom: '12px' }}>
                      <FileTextOutlined style={{ color: '#666' }} />
                      <Text strong style={{ fontSize: '16px' }}>
                        Description
                      </Text>
                    </Space>
                    <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                      {product.product_description ||
                        'No description available'}
                    </Paragraph>
                  </div>

                  <Divider />

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Space>
                        <CalendarOutlined style={{ color: '#666' }} />
                        <div>
                          <Text type='secondary' style={{ fontSize: '12px' }}>
                            Created
                          </Text>
                          <br />
                          <Text strong>
                            {formatDate(product.created_timestamp)}
                          </Text>
                        </div>
                      </Space>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Space>
                        <CalendarOutlined style={{ color: '#666' }} />
                        <div>
                          <Text type='secondary' style={{ fontSize: '12px' }}>
                            Last Updated
                          </Text>
                          <br />
                          <Text strong>
                            {formatDate(product.updated_timestamp)}
                          </Text>
                        </div>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Card>
      </motion.div>
    </ProtectedRoute>
  );
}
