import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  FileText, 
  Plus,
  Edit2,
  Save,
  X,
  Upload,
  Download,
  Trash2,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import ProjectCalendarAdmin from './ProjectCalendarAdmin';

interface ProjectViewerProps {
  projectId: string;
  clientName: string;
  onClose: () => void;
}

interface ProjectStage {
  id: string;
  stage_name: string;
  stage_description: string;
  status: string;
  progress_percentage: number;
  due_date: string;
  assigned_team_members: string[];
  client_approval: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  approval_notes: string;
  approved_at: string;
}

interface TeamMember {
  id: string;
  member_name: string;
  role: string;
  email: string;
  phone: string;
  is_primary_contact: boolean;
}

interface ProjectMessage {
  id: string;
  sender_name: string;
  sender_type: string;
  message_text: string;
  created_at: string;
  stage_context?: string;
}

interface ProjectFile {
  id: string;
  file_name: string;
  uploaded_by_type: string;
  file_size: number;
  created_at: string;
  description: string;
}

const ProjectViewer = ({ projectId, clientName, onClose }: ProjectViewerProps) => {
  const [project, setProject] = useState<any>(null);
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    member_name: '',
    role: '',
    email: '',
    phone: '',
    is_primary_contact: false
  });
  const [showAddTeamMember, setShowAddTeamMember] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjectData();

    // Set up realtime subscription for stage updates
    const channel = supabase
      .channel('admin-project-stages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_stages',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          loadProjectData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const loadProjectData = async () => {
    setIsLoading(true);
    try {
      const { data: projectData } = await supabase
        .from('client_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      setProject(projectData);

      const { data: stagesData } = await supabase
        .rpc('get_project_stages', { p_project_id: projectId });
      setStages(stagesData || []);

      const { data: teamData } = await supabase
        .rpc('get_project_team_members', { p_project_id: projectId });
      setTeamMembers(teamData || []);

      const { data: messagesData } = await supabase
        .rpc('get_project_messages', { p_project_id: projectId });
      setMessages(messagesData || []);

      const { data: filesData } = await supabase
        .rpc('get_project_files', { p_project_id: projectId });
      setFiles(filesData || []);

    } catch (error) {
      console.error('Error loading project data:', error);
      toast({
        title: "Error",
        description: "Failed to load project data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStageStatus = async (stageId: string, status: string, progress?: number) => {
    try {
      const { error } = await supabase.rpc('update_project_stage_details', {
        p_stage_id: stageId,
        p_status: status,
        p_progress_percentage: progress
      });

      if (error) throw error;
      await loadProjectData();
      toast({
        title: "Success",
        description: "Stage updated successfully.",
      });
    } catch (error) {
      console.error('Error updating stage:', error);
      toast({
        title: "Error",
        description: "Failed to update stage.",
        variant: "destructive"
      });
    }
  };

  const saveStageEdit = async (stage: ProjectStage) => {
    try {
      const { error } = await supabase.rpc('update_project_stage_details', {
        p_stage_id: stage.id,
        p_stage_description: stage.stage_description,
        p_due_date: stage.due_date || null,
        p_assigned_team_members: stage.assigned_team_members,
        p_progress_percentage: stage.progress_percentage
      });

      if (error) throw error;
      setEditingStage(null);
      await loadProjectData();
      toast({
        title: "Success",
        description: "Stage details saved.",
      });
    } catch (error) {
      console.error('Error saving stage:', error);
      toast({
        title: "Error",
        description: "Failed to save stage details.",
        variant: "destructive"
      });
    }
  };

  const addTeamMember = async () => {
    if (!newTeamMember.member_name || !newTeamMember.role) {
      toast({
        title: "Error",
        description: "Please fill in required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('add_project_team_member', {
        p_project_id: projectId,
        p_member_name: newTeamMember.member_name,
        p_role: newTeamMember.role,
        p_email: newTeamMember.email || null,
        p_phone: newTeamMember.phone || null,
        p_is_primary_contact: newTeamMember.is_primary_contact
      });

      if (error) throw error;

      setNewTeamMember({
        member_name: '',
        role: '',
        email: '',
        phone: '',
        is_primary_contact: false
      });
      setShowAddTeamMember(false);
      await loadProjectData();
      toast({
        title: "Team Member Added",
        description: "New team member has been added to the project.",
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error",
        description: "Failed to add team member.",
        variant: "destructive"
      });
    }
  };

  const deleteTeamMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { error } = await supabase.rpc('delete_project_team_member', {
        p_member_id: memberId
      });

      if (error) throw error;
      await loadProjectData();
      toast({
        title: "Success",
        description: "Team member removed.",
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member.",
        variant: "destructive"
      });
    }
  };

  const sendAdminMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.rpc('insert_project_message', {
        p_project_id: projectId,
        p_sender_id: '00000000-0000-0000-0000-000000000000',
        p_sender_name: 'Admin',
        p_message_text: newMessage,
        p_sender_type: 'team'
      });

      if (error) throw error;

      setNewMessage('');
      await loadProjectData();
      toast({
        title: "Message Sent",
        description: "Message has been sent to the client.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { error } = await supabase.rpc('create_project_file_metadata', {
        p_project_id: projectId,
        p_uploaded_by: '00000000-0000-0000-0000-000000000000',
        p_uploaded_by_type: 'admin',
        p_file_name: file.name,
        p_file_type: file.type,
        p_file_size: file.size,
        p_description: 'Uploaded by admin'
      });

      if (error) throw error;
      await loadProjectData();
      toast({
        title: "Success",
        description: "File uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file.",
        variant: "destructive"
      });
    } finally {
      setUploadingFile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold">{project?.project_name}</h2>
            <p className="text-sm text-muted-foreground">Client: {clientName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stages">Stages</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Project Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">{project?.current_stage}</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Team Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teamMembers.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{messages.length}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stages" className="space-y-4">
              {stages.map((stage) => {
                // Filter messages for this stage
                const stageMessages = messages.filter(
                  msg => msg.stage_context === stage.stage_name
                );

                return (
                  <Card key={stage.id} className={
                    stage.client_approval === 'revision_requested' 
                      ? 'border-yellow-300 bg-yellow-50/50' 
                      : stage.client_approval === 'rejected'
                      ? 'border-red-300 bg-red-50/50'
                      : ''
                  }>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">{stage.stage_name}</h4>
                            {stage.client_approval === 'approved' && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Client Approved
                              </Badge>
                            )}
                            {stage.client_approval === 'revision_requested' && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Revision Requested
                              </Badge>
                            )}
                            {stage.client_approval === 'rejected' && (
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                <X className="h-3 w-3 mr-1" />
                                Rejected
                              </Badge>
                            )}
                            {stage.client_approval === 'pending' && stage.status === 'completed' && (
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending Review
                              </Badge>
                            )}
                          </div>
                          {editingStage === stage.id ? (
                            <Textarea
                              value={stage.stage_description}
                              onChange={(e) => {
                                const updated = stages.map(s =>
                                  s.id === stage.id ? { ...s, stage_description: e.target.value } : s
                                );
                                setStages(updated);
                              }}
                              className="mt-2"
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground mt-1">
                              {stage.stage_description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {editingStage === stage.id ? (
                            <Button size="sm" onClick={() => saveStageEdit(stage)}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingStage(stage.id)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Client Feedback Section - Highlighted for Revision Requests */}
                      {stage.approval_notes && (
                        <div className={`p-4 rounded-lg border-2 ${
                          stage.client_approval === 'revision_requested'
                            ? 'bg-yellow-50 border-yellow-300'
                            : stage.client_approval === 'rejected'
                            ? 'bg-red-50 border-red-300'
                            : 'bg-blue-50 border-blue-300'
                        }`}>
                          <div className="flex items-start gap-2 mb-2">
                            <MessageSquare className={`h-5 w-5 mt-0.5 ${
                              stage.client_approval === 'revision_requested'
                                ? 'text-yellow-700'
                                : stage.client_approval === 'rejected'
                                ? 'text-red-700'
                                : 'text-blue-700'
                            }`} />
                            <div className="flex-1">
                              <h5 className={`font-semibold mb-1 ${
                                stage.client_approval === 'revision_requested'
                                  ? 'text-yellow-900'
                                  : stage.client_approval === 'rejected'
                                  ? 'text-red-900'
                                  : 'text-blue-900'
                              }`}>
                                Client Feedback:
                              </h5>
                              <p className={`text-sm whitespace-pre-wrap ${
                                stage.client_approval === 'revision_requested'
                                  ? 'text-yellow-800'
                                  : stage.client_approval === 'rejected'
                                  ? 'text-red-800'
                                  : 'text-blue-800'
                              }`}>
                                {stage.approval_notes}
                              </p>
                              {stage.approved_at && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Submitted: {new Date(stage.approved_at).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Project Team Messages for this Stage */}
                      {stageMessages.length > 0 && (
                        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                          <h5 className="font-semibold text-sm flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Project Team Messages:
                          </h5>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {stageMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`p-3 rounded-lg text-sm ${
                                  msg.sender_type === 'admin' 
                                    ? 'bg-blue-50 border border-blue-200 ml-0 mr-8' 
                                    : 'bg-white border border-gray-200 ml-8 mr-0'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <p className="text-xs font-semibold text-muted-foreground">
                                    {msg.sender_name} <span className="font-normal">({msg.sender_type === 'admin' ? 'Team' : 'Client'})</span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(msg.created_at).toLocaleString('en-NZ', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                        <Label>Status</Label>
                        <Select 
                          value={stage.status}
                          onValueChange={(value) => updateStageStatus(stage.id, value, stage.progress_percentage)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_started">Not Started</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Progress: {stage.progress_percentage}%</Label>
                        </div>
                        <Slider
                          value={[stage.progress_percentage]}
                          onValueChange={(value) => {
                            const updated = stages.map(s =>
                              s.id === stage.id ? { ...s, progress_percentage: value[0] } : s
                            );
                            setStages(updated);
                          }}
                          onValueCommit={(value) => updateStageStatus(stage.id, stage.status, value[0])}
                          max={100}
                          step={5}
                        />
                      </div>

                      {editingStage === stage.id && (
                        <div>
                          <Label>Due Date</Label>
                          <Input
                            type="date"
                            value={stage.due_date || ''}
                            onChange={(e) => {
                              const updated = stages.map(s =>
                                s.id === stage.id ? { ...s, due_date: e.target.value } : s
                              );
                              setStages(updated);
                            }}
                            className="mt-1"
                          />
                        </div>
                      )}

                      {stage.assigned_team_members?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Team: {stage.assigned_team_members.join(', ')}</span>
                        </div>
                      )}
                      {stage.due_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {format(new Date(stage.due_date), 'PPP')}</span>
                        </div>
                      )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Team Members</h3>
                <Button onClick={() => setShowAddTeamMember(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>

              {showAddTeamMember && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Team Member</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Name *</Label>
                        <Input
                          value={newTeamMember.member_name}
                          onChange={(e) => setNewTeamMember({...newTeamMember, member_name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Role *</Label>
                        <Input
                          value={newTeamMember.role}
                          onChange={(e) => setNewTeamMember({...newTeamMember, role: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newTeamMember.email}
                          onChange={(e) => setNewTeamMember({...newTeamMember, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={newTeamMember.phone}
                          onChange={(e) => setNewTeamMember({...newTeamMember, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addTeamMember}>Add Member</Button>
                      <Button variant="outline" onClick={() => setShowAddTeamMember(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{member.member_name}</h4>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                          {member.email && (
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {member.is_primary_contact && (
                            <Badge variant="outline">Primary Contact</Badge>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => deleteTeamMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <ProjectCalendarAdmin projectId={projectId} />
            </TabsContent>

            <TabsContent value="communication" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Messages</CardTitle>
                    <Badge variant="secondary">{messages.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4 mb-4">
                    {messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No messages yet. Start the conversation!
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div key={message.id} className="border-b pb-4 last:border-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={message.sender_type === 'admin' ? 'default' : 'outline'}>
                                  {message.sender_name}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(message.created_at), 'PPp')}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm">{message.message_text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="space-y-2">
                    <Label>Send Message to Client</Label>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="min-h-[80px]"
                    />
                    <Button onClick={sendAdminMessage} disabled={sendingMessage || !newMessage.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      {sendingMessage ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Project Files</CardTitle>
                    <div className="flex gap-2">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <Button size="sm" disabled={uploadingFile} asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingFile ? 'Uploading...' : 'Upload File'}
                          </span>
                        </Button>
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {files.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No files uploaded yet. Upload your first file!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{file.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded by {file.uploaded_by_type} • {format(new Date(file.created_at), 'PPp')}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProjectViewer;