'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Form,
  Input,
  InputNumber,
  Typography,
  message,
  Spin,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

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

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

      const response = await axios.get(`/api/product?product_id=${productId}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (response.data.is_success) {
        const product = response.data.data;
        form.setFieldsValue({
          product_title: product.product_title,
          product_price: product.product_price,
          product_description: product.product_description,
          product_image: product.product_image,
          product_category: product.product_category,
        });
      } else {
        message.error('Failed to fetch product details');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      message.error('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: ProductFormData) => {
    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) {
        message.error('Authentication failed');
        return;
      }

      const response = await axios.put(
        '/api/product',
        {
          product_id: productId,
          ...values,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.is_success) {
        message.success('Product updated successfully');
        router.push(`/products/${productId}`);
      } else {
        message.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      message.error('Failed to update product');
    } finally {
      setSubmitting(false);
    }
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
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(`/products/${productId}`)}
            style={{ marginBottom: '24px' }}
          >
            Back to Product Detail
          </Button>

          <Title level={2} style={{ marginBottom: '24px', color: '#1890ff' }}>
            Edit Product
          </Title>

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
            >
              <Input placeholder='Enter product title' />
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
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
              />
            </Form.Item>

            <Form.Item name='product_description' label='Description'>
              <TextArea
                rows={4}
                placeholder='Enter product description'
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item name='product_category' label='Category'>
              <Input placeholder='Enter product category' />
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
            >
              <Input placeholder='Enter image URL (e.g., https://example.com/image.jpg)' />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => router.push(`/products/${productId}`)}>
                  Cancel
                </Button>
                <Button type='primary' htmlType='submit' loading={submitting}>
                  Update Product
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </ProtectedRoute>
  );
}
