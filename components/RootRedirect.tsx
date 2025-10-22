'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spin } from 'antd';

export const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User sudah login, redirect ke products
        console.log('Root redirect: User logged in, going to products');
        router.push('/products');
      } else {
        // User belum login, redirect ke login
        console.log('Root redirect: User not logged in, going to login');
        router.push('/login');
      }
    }
  }, [user, loading, router]);

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
};
