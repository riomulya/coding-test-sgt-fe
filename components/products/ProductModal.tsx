import React from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Typography,
} from 'antd';
import { motion } from 'framer-motion';
import { Product, ProductFormData } from '@/types/product.types';

const { Title } = Typography;
const { TextArea } = Input;

interface ProductModalProps {
  visible: boolean;
  editingProduct: Product | null;
  onCancel: () => void;
  onSubmit: (values: ProductFormData) => void;
  form: any;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  editingProduct,
  onCancel,
  onSubmit,
  form,
}) => {
  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            {editingProduct ? '✏️ Edit Product' : '➕ Create Product'}
          </Title>
        </div>
      }
      open={visible}
      onCancel={onCancel}
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
          onFinish={onSubmit}
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
                onClick={onCancel}
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
  );
};
