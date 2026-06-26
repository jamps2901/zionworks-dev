import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Calendar, DollarSign, Mail, Phone, User, CheckCircle2, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface IntakeRequest {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  project_type: string;
  project_description: string;
  timeline: string;
  budget_range: string;
  created_at: string;
  status?: string;
}

const IntakeManager = () => {
  const [requests, setRequests] = useState<IntakeRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<IntakeRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIntakeRequests();
  }, []);

  const loadIntakeRequests = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_pending_intake_requests');

      if (error) throw error;

      setRequests(data || []);
    } catch (error) {
      console.error('Error loading intake requests:', error);
      toast({
        title: "Error",
        description: "Failed to load intake requests",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    setIsApproving(true);
    try {
      const { data, error } = await supabase
        .rpc('approve_client_intake', {
          p_request_id: requestId,
          p_admin_email: 'jrpatnugot29@gmail.com', // Current admin email
          p_admin_notes: adminNotes
        });

      if (error) throw error;

      // Send welcome email to new client
      const request = requests.find(r => r.id === requestId);
      if (request) {
        await supabase.functions.invoke('send-client-welcome', {
          body: {
            client_id: data,
            company_name: request.company_name,
            contact_name: request.contact_name,
            email: request.email,
            project_type: request.project_type
          }
        });
      }

      toast({
        title: "Request Approved",
        description: "Client account created and welcome email sent."
      });

      // Refresh the list
      loadIntakeRequests();
      setSelectedRequest(null);
      setAdminNotes('');

    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Approval Failed",
        description: "Failed to approve request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsApproving(false);
    }
  };

  const getProjectTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'website': 'bg-blue-100 text-blue-800',
      'mobile-app': 'bg-green-100 text-green-800',
      'ecommerce': 'bg-purple-100 text-purple-800',
      'webapp': 'bg-orange-100 text-orange-800',
      'branding': 'bg-pink-100 text-pink-800',
      'consultation': 'bg-gray-100 text-gray-800',
      'other': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Client Intake Requests</h2>
          <p className="text-muted-foreground">Review and approve new client project requests</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {requests.length} Pending
        </Badge>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
            <p className="text-muted-foreground">All intake requests have been processed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {request.company_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {request.contact_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(request.created_at), 'MMM dd, yyyy')}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getProjectTypeColor(request.project_type)}>
                      {request.project_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    <Badge variant="outline" className="text-orange-600">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{request.email}</span>
                    </div>
                    {request.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{request.phone}</span>
                      </div>
                    )}
                    {request.budget_range && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>{request.budget_range.replace('-', ' - ').replace('k', 'K')}</span>
                      </div>
                    )}
                  </div>
                  
                  {request.timeline && (
                    <div className="text-sm">
                      <span className="font-medium">Timeline: </span>
                      <span>{request.timeline.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <span className="font-medium">Description: </span>
                    <span className="text-muted-foreground">
                      {request.project_description.length > 150 
                        ? `${request.project_description.substring(0, 150)}...` 
                        : request.project_description}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review & Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Review Client Request</DialogTitle>
                          <DialogDescription>
                            Review the details and approve to create a client account and project.
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedRequest && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-semibold">Company</Label>
                                <p>{selectedRequest.company_name}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Contact</Label>
                                <p>{selectedRequest.contact_name}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Email</Label>
                                <p>{selectedRequest.email}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Phone</Label>
                                <p>{selectedRequest.phone || 'Not provided'}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Project Type</Label>
                                <p>{selectedRequest.project_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Timeline</Label>
                                <p>{selectedRequest.timeline?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Budget</Label>
                                <p>{selectedRequest.budget_range?.replace('-', ' - ').replace('k', 'K') || 'Not specified'}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Submitted</Label>
                                <p>{format(new Date(selectedRequest.created_at), 'MMM dd, yyyy HH:mm')}</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="font-semibold">Project Description</Label>
                              <p className="mt-1 text-sm bg-muted p-3 rounded-md">
                                {selectedRequest.project_description}
                              </p>
                            </div>
                            
                            <div>
                              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                              <Textarea
                                id="adminNotes"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add any internal notes about this client or project..."
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="outline" 
                                onClick={() => setSelectedRequest(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => approveRequest(selectedRequest.id)}
                                disabled={isApproving}
                              >
                                {isApproving ? 'Creating Account...' : 'Approve & Create Account'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default IntakeManager;