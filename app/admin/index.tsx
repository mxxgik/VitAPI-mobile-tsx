import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

const AdminIndex: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users');
  }, [router]);

  return null;
};

export default AdminIndex;