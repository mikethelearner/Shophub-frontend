import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { getProfile } from '@/lib/api';
import useAuth from '@/hooks/useAuth';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load profile',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p>Failed to load profile. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input value={profile.name} disabled />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input value={profile.email} disabled />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input value={profile.phone} disabled />
          </div>

          <div className="pt-4">
            <Button
              className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]"
              onClick={() => navigate('/shop')}
            >
              Go Shopping
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile; 