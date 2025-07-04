
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface College {
  id: string;
  name: string;
  domain: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    display_name: '',
    role: null as 'student' | 'faculty' | 'mentor' | 'platform_admin' | null,
    college_id: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [colleges, setColleges] = useState<College[]>([]);
  
  const { signUp, isLoading } = useAuth();
  const navigate = useNavigate();

  // Fetch colleges for selection
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const { data, error } = await supabase
          .from('colleges')
          .select('id, name, domain')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error fetching colleges:', error);
          toast.error('Failed to load colleges');
        } else {
          setColleges(data || []);
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
        toast.error('Failed to load colleges');
      }
    };

    fetchColleges();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user starts typing
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      role: value as 'student' | 'faculty' | 'mentor' | 'platform_admin' 
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.display_name || !formData.role) {
      return 'Please fill in all required fields';
    }

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    if (!formData.email.includes('@')) {
      return 'Please enter a valid email address';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Ensure role is not null before creating signupData
    if (!formData.role) {
      setError('Please select a role');
      return;
    }

    const signupData = {
      email: formData.email,
      password: formData.password,
      display_name: formData.display_name,
      role: formData.role,
      college_id: formData.college_id || undefined,
    };

    const result = await signUp(signupData);
    
    if (result.success) {
      navigate('/auth/login', { 
        state: { 
          message: 'Account created successfully! Please check your email to verify your account.' 
        }
      });
    } else {
      setError(result.error || 'Failed to create account');
    }
  };

  const handleDemoAccount = async (role: 'student' | 'faculty' | 'mentor' | 'platform_admin') => {
    const demoAccounts = {
      student: { email: 'student@demo.com', password: 'demo123456' },
      faculty: { email: 'faculty@demo.com', password: 'demo123456' },
      mentor: { email: 'mentor@demo.com', password: 'demo123456' },
      platform_admin: { email: 'admin@demo.com', password: 'demo123456' },
    };

    const demo = demoAccounts[role];
    setFormData({
      email: demo.email,
      password: demo.password,
      confirmPassword: demo.password,
      display_name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role: role,
      college_id: colleges[0]?.id || '',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Fill in the details below to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="display_name">Full Name *</Label>
              <Input
                id="display_name"
                type="text"
                placeholder="Enter your full name"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role || ''} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="platform_admin">Platform Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {colleges.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="college">College (Optional)</Label>
                <Select value={formData.college_id} onValueChange={(value) => handleInputChange('college_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={college.id}>
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password (min 8 characters)"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              <UserPlus className="w-4 h-4 mr-2" />
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">Quick setup with demo accounts:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoAccount('student')}
                  disabled={isLoading}
                >
                  Student Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoAccount('faculty')}
                  disabled={isLoading}
                >
                  Faculty Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoAccount('mentor')}
                  disabled={isLoading}
                >
                  Mentor Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoAccount('platform_admin')}
                  disabled={isLoading}
                >
                  Admin Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
