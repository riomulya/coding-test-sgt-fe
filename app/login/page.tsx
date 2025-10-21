'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Space,
  Divider,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/products');
    }
  }, [user, router]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Login successful!');
      router.push('/products');
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle specific Firebase errors
      let errorMessage = 'Login failed';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Space direction='vertical' size='large' style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                Welcome Back
              </Title>
              <Text type='secondary'>Sign in to your account</Text>
            </div>

            <Form
              name='login'
              onFinish={handleSubmit}
              autoComplete='off'
              layout='vertical'
              size='large'
            >
              <Form.Item
                name='email'
                label='Email'
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder='Enter your email'
                />
              </Form.Item>

              <Form.Item
                name='password'
                label='Password'
                rules={[
                  { required: true, message: 'Please input your password!' },
                  {
                    min: 6,
                    message: 'Password must be at least 6 characters!',
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder='Enter your password'
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type='primary'
                  htmlType='submit'
                  loading={loading}
                  icon={<LoginOutlined />}
                  style={{ width: '100%' }}
                  size='large'
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <Divider>
              <Text type='secondary'>Don't have an account?</Text>
            </Divider>

            <Link href='/signup' style={{ width: '100%' }}>
              <Button
                icon={<UserAddOutlined />}
                style={{ width: '100%' }}
                size='large'
              >
                Create Account
              </Button>
            </Link>
          </Space>
        </motion.div>
      </Card>
    </motion.div>
  );
}
