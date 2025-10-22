import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { theme } from '../styles/theme';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireRole,
}) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (requireAuth && !user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Please log in to access this page</Text>
      </View>
    );
  }

  if (requireRole && user?.role !== requireRole) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Access denied. Insufficient permissions.</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
});

export default AuthGuard;