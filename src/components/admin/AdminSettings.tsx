import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Key, User } from 'lucide-react';

interface AdminSettingsProps {
  adminEmail: string;
}

const AdminSettings = ({ adminEmail }: AdminSettingsProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState(adminEmail);
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error", 
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use Supabase Auth to update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        toast({
          title: "Error",
          description: updateError.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Password updated successfully"
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newEmail === adminEmail) {
      toast({
        title: "No Changes",
        description: "Email address is the same as current email",
        variant: "default"
      });
      return;
    }

    if (!newEmail.includes('@') || !newEmail.includes('.')) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsEmailLoading(true);

    try {
      // Use Supabase Auth to update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (updateError) {
        toast({
          title: "Error",
          description: updateError.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Verification Email Sent",
        description: "Please check your new email address to confirm the change."
      });

      // Logout after requesting email change
      setTimeout(() => {
        handleLogout();
      }, 2000);
      
    } catch (error) {
      console.error('Email update error:', error);
      toast({
        title: "Error", 
        description: "Failed to update email address",
        variant: "destructive"
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('zionworks_admin_authenticated');
    localStorage.removeItem('zionworks_admin_email');
    localStorage.removeItem('zionworks_admin_login_time');
    window.location.href = '/admin';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Admin Settings</h1>
        <p className="text-muted-foreground">Manage your admin account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Account Information
          </h3>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                You will need to re-login after changing your email
              </p>
            </div>
            <Button 
              type="submit" 
              disabled={isEmailLoading || newEmail === adminEmail}
              variant="outline"
              className="w-full"
            >
              {isEmailLoading ? "Updating..." : "Update Email"}
            </Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="relative">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="relative">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <div className="relative">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Logout Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Session Management</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Logout from Admin Panel</p>
            <p className="text-sm text-muted-foreground">
              End your current admin session
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;