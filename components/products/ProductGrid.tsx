// components/products/ProductGrid.tsx
import React from 'react';
import { Card, Row, Col, Tag, Tooltip, Popconfirm } from 'antd';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Typography } from 'antd';

const { Text } = Typography;

interface Product {
  product_id: string;
  product_title: string;
  product_price: number;
  product_description?: string;
  product_category?: string;
  product_image?: string;
}

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();

  return (
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
                  <EditOutlined key='edit' onClick={() => onEdit(product)} />
                </Tooltip>,
                <Tooltip title='Delete'>
                  <Popconfirm
                    title='Delete this product?'
                    onConfirm={() => onDelete(product.product_id.trim())}
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
};
