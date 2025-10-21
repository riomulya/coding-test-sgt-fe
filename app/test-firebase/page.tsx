// app/test-firebase/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function TestFirebasePage() {
  const { user, token, loading } = useAuth();

  useEffect(() => {
    console.log('🧪 Firebase Test:');
    console.log('User:', user?.email);
    console.log('Token:', token ? `${token.substring(0, 50)}...` : 'null');
    console.log('Loading:', loading);

    if (token) {
      // Test backend API call
      fetch('/api/test-token', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => console.log('Backend response:', data))
        .catch((err) => console.error('Backend error:', err));
    }
  }, [user, token, loading]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold'>Firebase Test</h1>
      <div className='mt-4 p-4 bg-gray-100 rounded'>
        <p>
          <strong>User:</strong> {user?.email || 'Not logged in'}
        </p>
        <p>
          <strong>Token:</strong> {token ? 'Present' : 'None'}
        </p>
        <p>
          <strong>Token Preview:</strong>{' '}
          {token ? `${token.substring(0, 50)}...` : 'N/A'}
        </p>
      </div>
    </div>
  );
}
