
import { useUser } from '@/hooks/useUser';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

const Index = () => {
  const { user, role, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to role-specific dashboard immediately
  if (role && user) {
    switch (role) {
      case 'student':
        return <Navigate to="/pages/student/dashboard" replace />;
      case 'faculty':
        return <Navigate to="/pages/faculty/dashboard" replace />;
      case 'mentor':
        return <Navigate to="/pages/mentor/dashboard" replace />;
      case 'platform_admin':
        return <Navigate to="/pages/platform_admin/dashboard" replace />;
      default:
        break;
    }
  }

  // If no role is found but user exists, show fallback
  if (user && !role) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to IntraLink</h1>
          <p className="text-muted-foreground">
            Setting up your account...
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{user.display_name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                Role being configured...
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no user, redirect to login
  return <Navigate to="/auth/login" replace />;
};

export default Index;
