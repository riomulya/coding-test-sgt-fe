import React from 'react';
import { Card, Row, Col, Input, Button, Space } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Grid } from 'antd';

const { useBreakpoint } = Grid;

interface ProductControlsProps {
  searchTerm: string;
  viewMode: 'table' | 'grid';
  loading: boolean;
  onSearch: (value: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
  onViewModeChange: (mode: 'table' | 'grid') => void;
}

export const ProductControls: React.FC<ProductControlsProps> = ({
  searchTerm,
  viewMode,
  loading,
  onSearch,
  onRefresh,
  onCreate,
  onViewModeChange,
}) => {
  const screens = useBreakpoint();

  return (
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
              placeholder='🔍 Search products,category,description...'
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
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
                onClick={() => onViewModeChange('table')}
                size={screens.xs ? 'middle' : 'large'}
              >
                {!screens.xs && 'Table'}
              </Button>
              <Button
                type={viewMode === 'grid' ? 'primary' : 'default'}
                icon={<AppstoreOutlined />}
                onClick={() => onViewModeChange('grid')}
                size={screens.xs ? 'middle' : 'large'}
              >
                {!screens.xs && 'Grid'}
              </Button>
            </Space>
          </Col>
          <Col xs={0} sm={12} md={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
                size={screens.xs ? 'middle' : 'large'}
              >
                {!screens.xs && 'Refresh'}
              </Button>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={onCreate}
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
  );
};
