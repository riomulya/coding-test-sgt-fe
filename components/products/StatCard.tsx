import React, { ReactNode } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { motion } from 'framer-motion';

// Definisikan interface untuk props
interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  prefix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  prefix,
}) => (
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
