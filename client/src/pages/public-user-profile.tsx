import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, Calendar, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PublicUser {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  accountType: string;
  createdAt: string;
  // Only include safe, public information
}

export default function PublicUserProfile() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  // Fetch public user profile
  const { data: userProfile, isLoading, error } = useQuery<PublicUser>({
    queryKey: ['/api/users', id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      return response.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            User Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The user profile you're looking for doesn't exist.
          </p>
          <Button onClick={() => setLocation('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return "Invalid date";
    }
  };

  const displayName = [userProfile.firstName, userProfile.lastName]
    .filter(Boolean)
    .join(' ') || userProfile.username;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        {/* User Profile */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground mb-1">
                  {displayName}
                </CardTitle>
                <p className="text-muted-foreground">@{userProfile.username}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Account Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Account Type:</span>
                    <div className="mt-1">
                      <Badge variant={
                        userProfile.accountType === 'Admin' ? 'default' : 
                        userProfile.accountType === 'Paid' ? 'outline' : 
                        'secondary'
                      }>
                        {userProfile.accountType || 'User'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Member Since:
                    </span>
                    <p className="mt-1 text-sm">
                      {formatDate(userProfile.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Note about privacy */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <Shield className="w-4 h-4 inline mr-2" />
                This is a public profile showing only basic information. Detailed personal and health information is kept private.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}