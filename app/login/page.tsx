'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Form, Input, Card, Typography, Divider, message } from 'antd';
import { GoogleOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { PublicRoute } from '@/components/PublicRoute';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Login successful!');
      router.push('/products');
    } catch (error: any) {
      console.error('Login error:', error);
      message.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      message.success('Google login successful!');
      router.push('/products');
    } catch (error: unknown) {
      console.error('Google login error:', error);
      message.error('Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <PublicRoute>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255,255,255,0.95)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Title
                level={2}
                style={{ color: '#1890ff', marginBottom: '8px' }}
              >
                Welcome Back
              </Title>
              <Text type='secondary'>Sign in to your account</Text>
            </div>

            <Form
              name='login'
              onFinish={handleLogin}
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
                  prefix={<MailOutlined />}
                  placeholder='Enter your email'
                  style={{ borderRadius: '8px' }}
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
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: '16px' }}>
                <Button
                  type='primary'
                  htmlType='submit'
                  loading={loading}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <Divider>
              <Text type='secondary'>Or continue with</Text>
            </Divider>

            <Button
              type='default'
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              loading={googleLoading}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                border: '2px solid #f0f0f0',
                background: '#fff',
                color: '#333',
              }}
            >
              Continue with Google
            </Button>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Text type='secondary'>
                Don't have an account?{' '}
                <Button
                  type='link'
                  onClick={() => router.push('/signup')}
                  style={{ padding: 0, fontWeight: '600' }}
                >
                  Sign up
                </Button>
              </Text>
            </div>
          </Card>
        </motion.div>
      </div>
    </PublicRoute>
  );
}
