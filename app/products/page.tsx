'use client';

import React, { useState } from 'react';
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
  Tag,
  Tooltip,
  Drawer,
  FloatButton,
  Grid,
} from 'antd';

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TagsOutlined,
  EyeOutlined,
  MenuOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/products/StatCard';
import { useProducts } from '@/hooks/useProducts';
import { ProductModal } from '@/components/products/ProductModal';
import { ProductControls } from '@/components/products/ProductControls';
import { ProductGrid } from '@/components/products/ProductGrid';
import { createProductColumns } from '@/components/products/ProductColumns'; // Import columns
import { Product, ProductFormData, ApiResponse } from '@/types/product.types';
const { Title, Text } = Typography;

export default function ProductsPage() {
  const { logout, loading: authLoading, user } = useAuth();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const router = useRouter();
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Gunakan custom hook
  const {
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
  } = useProducts();

  // Handle form submit dengan form instance
  const handleFormSubmit = async (values: ProductFormData) => {
    await handleSubmit(values);
    form.resetFields();
  };

  // Handle create product dengan reset form
  const handleCreateProduct = () => {
    form.resetFields();
    handleCreate();
  };

  // Handle edit product dengan set form values
  const handleEditProduct = (product: ProductFormData) => {
    form.setFieldsValue({
      product_title: product.product_title,
      product_price: product.product_price,
      product_description: product.product_description,
      product_image: product.product_image,
      product_category: product.product_category,
    });
    handleEdit(product as Product);
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

  // Table columns - MENGGUNAKAN KOMPONEN TERPISAH
  const columns = createProductColumns({
    router,
    currentPage,
    pageSize,
    products,
    handleEdit: handleEditProduct,
    handleDelete,
  });

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
          <ProductControls
            searchTerm={searchTerm}
            viewMode={viewMode}
            loading={loading}
            onSearch={handleSearch}
            onRefresh={fetchProducts}
            onCreate={handleCreateProduct}
            onViewModeChange={setViewMode}
          />

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
              <ProductGrid
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDelete}
              />
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
          onClick={handleCreateProduct}
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
                handleCreateProduct();
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
        <ProductModal
          visible={modalVisible}
          editingProduct={editingProduct}
          onCancel={() => setModalVisible(false)}
          onSubmit={handleFormSubmit}
          form={form}
        />
      </div>
    </ProtectedRoute>
  );
}
