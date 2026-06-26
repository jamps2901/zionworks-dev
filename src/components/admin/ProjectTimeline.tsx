import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Calendar,
  Users,
  FileCheck,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProjectTimelineProps {
  projectId: string;
  clientId: string;
}

interface ProjectStage {
  id: string;
  stage_name: string;
  status: string;
  progress_percentage: number;
  assigned_team_members: string[];
  stage_description: string;
  due_date: string;
  completed_at: string;
  client_approval: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  approval_notes: string;
  approved_at: string;
  created_at: string;
  updated_at: string;
}

const ProjectTimeline = ({ projectId, clientId }: ProjectTimelineProps) => {
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});
  const [submittingApproval, setSubmittingApproval] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const stageOrder = [
    'kick_off',
    'requirements_gathering',
    'sow_upload_signoff',
    'design',
    'development',
    'testing',
    'uat',
    'go_live',
    'post_go_live_support'
  ];

  const stageLabels: Record<string, string> = {
    'kick_off': 'Kick-off',
    'requirements_gathering': 'Requirements Gathering',
    'sow_upload_signoff': 'SOW Upload & Sign-off',
    'design': 'Design',
    'development': 'Development',
    'testing': 'Testing',
    'uat': 'User Acceptance Testing',
    'go_live': 'Go Live',
    'post_go_live_support': 'Post Go-Live Support'
  };

  const stageDescriptions: Record<string, string> = {
    'kick_off': 'Project kickoff meeting, team introductions, and initial planning.',
    'requirements_gathering': 'Detailed requirements collection, analysis, and documentation.',
    'sow_upload_signoff': 'Statement of Work finalization and client approval.',
    'design': 'UI/UX design, wireframes, mockups, and design system creation.',
    'development': 'Core development work, feature implementation, and integration.',
    'testing': 'Quality assurance testing, system testing, and bug fixes.',
    'uat': 'User acceptance testing with client involvement and feedback.',
    'go_live': 'Production deployment, final testing, and launch preparation.',
    'post_go_live_support': 'Post-launch monitoring, support, and maintenance.'
  };

  useEffect(() => {
    loadStages();
  }, [projectId]);

  const loadStages = async () => {
    try {
      // Load real project stages
      const { data, error } = await supabase
        .rpc('get_project_stages', { p_project_id: projectId });

      if (error) throw error;

      // Use actual stages from database
      setStages(data || []);
    } catch (error) {
      console.error('Error loading stages:', error);
      toast({
        title: "Error",
        description: "Failed to load project timeline.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTeamMembers = (stageName: string): string[] => {
    const teamAssignments: Record<string, string[]> = {
      'kick_off': ['Sarah Johnson', 'Michael Chen'],
      'requirements_gathering': ['Sarah Johnson', 'Emily Rodriguez'],
      'sow_upload_signoff': ['Sarah Johnson'],
      'design': ['Emily Rodriguez', 'Sarah Johnson'],
      'development': ['Michael Chen', 'David Kim'],
      'testing': ['David Kim', 'Michael Chen'],
      'uat': ['Sarah Johnson', 'Emily Rodriguez'],
      'go_live': ['Michael Chen', 'David Kim'],
      'post_go_live_support': ['Sarah Johnson', 'Michael Chen']
    };
    return teamAssignments[stageName] || ['Project Manager'];
  };

  const handleApproval = async (stageId: string, approval: 'approved' | 'rejected' | 'revision_requested') => {
    // Check if this is demo data
    if (stageId.startsWith('demo-') || stageId.startsWith('placeholder-')) {
      // Update demo data locally for visual feedback
      setStages(prev => prev.map(stage => 
        stage.id === stageId 
          ? { 
              ...stage, 
              client_approval: approval,
              approval_notes: approvalNotes[stageId] || '',
              approved_at: new Date().toISOString()
            }
          : stage
      ));
      
      setApprovalNotes(prev => ({ ...prev, [stageId]: '' }));
      
      toast({
        title: "Demo Approval",
        description: `This is a demo. Stage ${approval === 'approved' ? 'approved' : 'feedback submitted'} locally.`,
        variant: "default"
      });
      return;
    }

    setSubmittingApproval(prev => ({ ...prev, [stageId]: true }));

    try {
      const { error } = await supabase
        .rpc('update_stage_approval', {
          p_stage_id: stageId,
          p_client_approval: approval,
          p_approval_notes: approvalNotes[stageId] || ''
        });

      if (error) throw error;

      await loadStages();
      setApprovalNotes(prev => ({ ...prev, [stageId]: '' }));

      toast({
        title: "Approval Submitted",
        description: `Stage ${approval === 'approved' ? 'approved' : 'feedback submitted'} successfully.`,
      });
    } catch (error) {
      console.error('Error submitting approval:', error);
      toast({
        title: "Error",
        description: "Failed to submit approval.",
        variant: "destructive"
      });
    } finally {
      setSubmittingApproval(prev => ({ ...prev, [stageId]: false }));
    }
  };

  const getStatusIcon = (stage: ProjectStage) => {
    if (stage.status === 'completed') {
      return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    } else if (stage.status === 'in_progress') {
      return <Clock className="h-6 w-6 text-blue-600" />;
    } else if (stage.status === 'blocked') {
      return <AlertCircle className="h-6 w-6 text-red-600" />;
    } else {
      return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'in_progress': return 'bg-blue-600';
      case 'blocked': return 'bg-red-600';
      default: return 'bg-gray-300';
    }
  };

  const getApprovalBadge = (approval: string) => {
    switch (approval) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Changes</Badge>;
      case 'revision_requested':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Revision Requested</Badge>;
      default:
        return <Badge variant="outline">Pending Review</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Project Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(stages.filter(s => s.status === 'completed').length / stages.length * 100)}% Complete</span>
            </div>
            <Progress 
              value={stages.filter(s => s.status === 'completed').length / stages.length * 100} 
              className="h-3"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stages.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stages.filter(s => s.status === 'in_progress').length}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {stages.filter(s => s.status === 'not_started').length}
                </div>
                <div className="text-sm text-muted-foreground">Not Started</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stages.filter(s => s.status === 'blocked').length}
                </div>
                <div className="text-sm text-muted-foreground">Blocked</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative ${
              stage.status === 'in_progress' ? 'ring-2 ring-blue-200 border-blue-300' : ''
            }`}>
              {/* Timeline line */}
              {index < stages.length - 1 && (
                <div className="absolute left-8 top-16 w-0.5 h-full bg-border z-0" />
              )}

              <CardContent className="p-6 relative z-10">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(stage)}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {stageLabels[stage.stage_name]}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          {stage.stage_description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          className={`${
                            stage.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                            stage.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            stage.status === 'blocked' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          {stage.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {getApprovalBadge(stage.client_approval)}
                      </div>
                    </div>

                    {stage.progress_percentage > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{stage.progress_percentage}%</span>
                        </div>
                        <Progress value={stage.progress_percentage} className="h-2" />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {stage.assigned_team_members?.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Team:</span>
                          <span>{stage.assigned_team_members.join(', ')}</span>
                        </div>
                      )}
                      {stage.due_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Due:</span>
                          <span>{new Date(stage.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Client Approval Section */}
                    {(stage.status === 'completed' || stage.status === 'in_progress') && 
                     stage.client_approval === 'pending' && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                          <FileCheck className="h-4 w-4" />
                          Client Sign-off Required
                        </h4>
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Add notes or feedback (optional)..."
                            value={approvalNotes[stage.id] || ''}
                            onChange={(e) => setApprovalNotes(prev => ({ 
                              ...prev, 
                              [stage.id]: e.target.value 
                            }))}
                            className="bg-white"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproval(stage.id, 'approved')}
                              disabled={submittingApproval[stage.id]}
                              className="gap-2"
                            >
                              <ThumbsUp className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproval(stage.id, 'revision_requested')}
                              disabled={submittingApproval[stage.id]}
                              className="gap-2"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Request Changes
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {stage.approval_notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Client Feedback:</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{stage.approval_notes}</p>
                        {stage.approved_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Submitted: {new Date(stage.approved_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTimeline;