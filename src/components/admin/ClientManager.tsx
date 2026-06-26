import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Mail, Phone, Calendar, MoreHorizontal, RotateCcw, Send, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProjectViewer from './ProjectViewer';

interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  created_at: string;
  has_completed_onboarding: boolean;
  onboarding_completed_at?: string;
  is_active: boolean;
}

const ClientManager = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isGhostClientDialogOpen, setIsGhostClientDialogOpen] = useState(false);
  const [ghostClientEmail, setGhostClientEmail] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [selectedProjectForView, setSelectedProjectForView] = useState<{projectId: string, clientName: string} | null>(null);
  const [newClient, setNewClient] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    password: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_clients' as any);
        

      if (error) throw error;
      setClients((data as any as Client[]) || []);
    } catch (error: any) {
      console.error('Error loading clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createClient = async () => {
    if (!newClient.company_name || !newClient.contact_name || !newClient.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.rpc('create_client_account', {
        p_company_name: newClient.company_name,
        p_contact_name: newClient.contact_name,
        p_email: newClient.email,
        p_phone: newClient.phone || null,
        p_temporary_password: newClient.password || null
      });

      if (error) throw error;

      // Send welcome email with credentials
      const tempPassword = newClient.password || Math.random().toString(36).slice(-8);
      const emailResult = await supabase.functions.invoke('send-client-credentials', {
        body: {
          email: newClient.email,
          clientName: newClient.contact_name,
          companyName: newClient.company_name,
          temporaryPassword: tempPassword,
          loginUrl: `${window.location.origin}/client-portal`
        }
      });

      if (emailResult.error) {
        console.warn('Email sending failed:', emailResult.error);
        toast({
          title: "Client Created",
          description: `${newClient.company_name} has been added, but welcome email failed to send. You can resend it manually.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Client Created",
          description: `${newClient.company_name} has been added and will receive login credentials via email.`,
        });
      }

      setNewClient({ company_name: '', contact_name: '', email: '', phone: '', password: '' });
      setIsAddDialogOpen(false);
      loadClients();
    } catch (error: any) {
      console.error('Error creating client:', error);
      
      if (error?.code === "23505" && error?.details?.includes("email")) {
        // Ghost client exists - offer recovery options
        setIsGhostClientDialogOpen(true);
        setGhostClientEmail(newClient.email);
      } else {
        toast({
          title: "Error",
          description: "Failed to create client account. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const resendWelcomeEmail = async (email: string, clientName: string, companyName: string) => {
    try {
      const tempPassword = Math.random().toString(36).slice(-8);
      
      await supabase.functions.invoke('send-client-credentials', {
        body: {
          email: email,
          clientName: clientName,
          companyName: companyName,
          temporaryPassword: tempPassword,
          loginUrl: `${window.location.origin}/client-portal`
        }
      });

      toast({
        title: "Email Sent",
        description: `Welcome email resent to ${email}.`,
      });
    } catch (error: any) {
      console.error('Error resending email:', error);
      toast({
        title: "Error",
        description: "Failed to send welcome email.",
        variant: "destructive",
      });
    }
  };

  const deleteClient = async (clientId: string, clientName: string) => {
    try {
      const { error } = await supabase.rpc('delete_client_account', {
        p_client_id: clientId
      });

      if (error) throw error;

      toast({
        title: "Client Deleted",
        description: `${clientName} has been removed.`,
      });

      loadClients();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client.",
        variant: "destructive",
      });
    }
  };

  const resetOnboarding = async (clientId: string, clientName: string) => {
    const confirmed = window.confirm(
      `⚠️ WARNING: Reset Onboarding for ${clientName}?\n\n` +
      `This will permanently delete ALL client data including:\n` +
      `• All project stages and progress\n` +
      `• All uploaded files and documents\n` +
      `• All messages and communications\n` +
      `• Team assignments and notifications\n` +
      `• All activity logs\n` +
      `• The entire project\n\n` +
      `The client will need to complete onboarding again from scratch.\n\n` +
      `⚠️ THIS ACTION CANNOT BE UNDONE!\n\n` +
      `Are you absolutely sure you want to proceed?`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase.rpc('reset_client_onboarding_and_data', {
        p_client_id: clientId
      });

      if (error) throw error;

      toast({
        title: "Client Data Reset",
        description: `All data for ${clientName} has been deleted. They will need to complete onboarding again.`,
      });

      loadClients();
    } catch (error: any) {
      console.error('Error resetting onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to reset client data.",
        variant: "destructive",
      });
    }
  };

  const recoverGhostClient = async () => {
    setIsRecovering(true);
    try {
      // Use the new recovery function that safely deletes and recreates
      const { data, error } = await supabase.rpc('recover_ghost_client', {
        p_email: ghostClientEmail,
        p_company_name: newClient.company_name,
        p_contact_name: newClient.contact_name,
        p_phone: newClient.phone || null,
        p_temporary_password: newClient.password || null
      });

      if (error) throw error;

      // Send welcome email with new credentials
      const tempPassword = newClient.password || Math.random().toString(36).slice(-8);
      const emailResult = await supabase.functions.invoke('send-client-credentials', {
        body: {
          email: ghostClientEmail,
          clientName: newClient.contact_name,
          companyName: newClient.company_name,
          temporaryPassword: tempPassword,
          loginUrl: `${window.location.origin}/client-portal`
        }
      });

      if (emailResult.error) {
        console.warn('Email sending failed:', emailResult.error);
        toast({
          title: "Client Recovered",
          description: `${newClient.company_name} has been successfully created, but welcome email failed to send. You can resend it manually.`,
        });
      } else {
        toast({
          title: "Client Recovered",
          description: `${newClient.company_name} has been successfully created and will receive login credentials.`,
        });
      }

      setNewClient({ company_name: '', contact_name: '', email: '', phone: '', password: '' });
      setIsAddDialogOpen(false);
      setIsGhostClientDialogOpen(false);
      setGhostClientEmail('');
      loadClients();
    } catch (error: any) {
      console.error('Error recovering client:', error);
      toast({
        title: "Recovery Failed",
        description: "Failed to recover the client. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const sendCredentialsToGhost = async () => {
    setIsRecovering(true);
    try {
      // Send credentials email with generated password
      const tempPassword = Math.random().toString(36).slice(-8);
      await supabase.functions.invoke('send-client-credentials', {
        body: {
          email: ghostClientEmail,
          clientName: 'Valued Client',
          companyName: 'Your Company',
          temporaryPassword: tempPassword,
          loginUrl: `${window.location.origin}/client-portal`
        }
      });

      toast({
        title: "Credentials Sent",
        description: `Login credentials have been sent to ${ghostClientEmail}.`,
      });

      setIsGhostClientDialogOpen(false);
      setGhostClientEmail('');
    } catch (error: any) {
      console.error('Error sending credentials:', error);
      toast({
        title: "Error",
        description: "Failed to send credentials.",
        variant: "destructive",
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const viewClientProject = async (clientId: string, clientName: string) => {
    try {
      const { data: projects } = await supabase
        .rpc('get_client_projects', { p_client_id: clientId });

      if (projects && projects.length > 0) {
        setSelectedProjectForView({ 
          projectId: projects[0].id, 
          clientName: clientName 
        });
      } else {
        toast({
          title: "No Project Found",
          description: "This client doesn't have any projects yet.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching client project:', error);
      toast({
        title: "Error",
        description: "Failed to load client project.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Client Management</h2>
          <p className="text-muted-foreground">Create and manage client accounts</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Client Account</DialogTitle>
              <DialogDescription>
                Create a new client account. They will receive login credentials via email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={newClient.company_name}
                  onChange={(e) => setNewClient({...newClient, company_name: e.target.value})}
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label htmlFor="contact_name">Contact Name *</Label>
                <Input
                  id="contact_name"
                  value={newClient.contact_name}
                  onChange={(e) => setNewClient({...newClient, contact_name: e.target.value})}
                  placeholder="Contact person's name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  placeholder="client@company.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newClient.password}
                  onChange={(e) => setNewClient({...newClient, password: e.target.value})}
                  placeholder="Leave blank to auto-generate"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createClient} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Client'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ghost Client Recovery Dialog */}
        <Dialog open={isGhostClientDialogOpen} onOpenChange={setIsGhostClientDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Client Already Exists</DialogTitle>
              <DialogDescription>
                A client with email <strong>{ghostClientEmail}</strong> already exists but may not be properly set up. 
                Choose how to proceed:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Recovery Options:</h4>
                <div className="space-y-2 text-sm text-yellow-700">
                  <p>• <strong>Replace & Send Credentials:</strong> Delete the old record and create a new one with your current form data</p>
                  <p>• <strong>Send Credentials Only:</strong> Send login credentials to the existing client</p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setIsGhostClientDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={sendCredentialsToGhost} disabled={isRecovering}>
                {isRecovering ? 'Sending...' : 'Send Credentials Only'}
              </Button>
              <Button onClick={recoverGhostClient} disabled={isRecovering}>
                {isRecovering ? 'Replacing...' : 'Replace & Send Credentials'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {clients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Create your first client account to get started with project management.
              </p>
            </CardContent>
          </Card>
        ) : (
          clients.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">{client.company_name}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {client.contact_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(client.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={client.has_completed_onboarding ? "default" : "secondary"}>
                      {client.has_completed_onboarding ? "Onboarded" : "Pending"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <DropdownMenuItem 
                           onClick={() => viewClientProject(client.id, client.company_name)}
                         >
                           <Eye className="w-4 h-4 mr-2" />
                           View Project
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                           onClick={() => resetOnboarding(client.id, client.contact_name)}
                         >
                           <RotateCcw className="w-4 h-4 mr-2" />
                           Reset Onboarding
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                           onClick={() => resendWelcomeEmail(client.email, client.contact_name, client.company_name)}
                         >
                           <Send className="w-4 h-4 mr-2" />
                           Resend Welcome Email
                         </DropdownMenuItem>
                         <DropdownMenuItem
                           onClick={() => deleteClient(client.id, client.contact_name)}
                           className="text-red-600"
                         >
                           <Trash2 className="w-4 h-4 mr-2" />
                           Delete Client
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.onboarding_completed_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Onboarded {new Date(client.onboarding_completed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
        {/* Project Viewer Modal */}
        {selectedProjectForView && (
          <ProjectViewer
            projectId={selectedProjectForView.projectId}
            clientName={selectedProjectForView.clientName}
            onClose={() => setSelectedProjectForView(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ClientManager;