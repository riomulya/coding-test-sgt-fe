// components/products/ProductColumns.tsx
import React from 'react';
import { Button, Space, Avatar, Popconfirm, Tag } from 'antd';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// Definisikan tipe untuk product
interface Product {
  product_id: string;
  product_title: string;
  product_price: number;
  product_description?: string;
  product_category?: string;
  product_image?: string;
}

// Tipe untuk fungsi handleEdit dan handleDelete
type HandleEditFunction = (product: Product) => void;
type HandleDeleteFunction = (productId: string) => void;

// Props untuk createProductColumns
interface ProductColumnsProps {
  router: AppRouterInstance;
  currentPage: number;
  pageSize: number;
  products: Product[];
  handleEdit: HandleEditFunction;
  handleDelete: HandleDeleteFunction;
}

// Fungsi untuk membuat columns
export const createProductColumns = ({
  router,
  currentPage,
  pageSize,
  products,
  handleEdit,
  handleDelete,
}: ProductColumnsProps) => [
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
                <PictureOutlined style={{ fontSize: '20px', color: '#999' }} />
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
