import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Users, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';

interface ProjectOverviewProps {
  projectId: string;
  clientId: string;
}

interface ProjectData {
  start_date: string | null;
  estimated_completion: string | null;
  budget_total: number | null;
  budget_used: number | null;
}

interface ProjectStats {
  total_tasks: number;
  completed_tasks: number;
  upcoming_deadlines: number;
  unread_messages: number;
  files_shared: number;
  team_members: number;
  overall_progress: number;
  current_milestone: string;
  next_deadline: string;
  estimated_completion: string;
}

const ProjectOverview = ({ projectId, clientId }: ProjectOverviewProps) => {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProjectStats();
    loadRecentActivity();
    loadProjectData();

    // Set up realtime subscriptions for live updates
    const stagesChannel = supabase
      .channel('project-stages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_stages',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          loadProjectStats();
          loadRecentActivity();
        }
      )
      .subscribe();

    const projectsChannel = supabase
      .channel('client-projects-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'client_projects',
          filter: `id=eq.${projectId}`
        },
        () => {
          loadProjectData();
          loadProjectStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stagesChannel);
      supabase.removeChannel(projectsChannel);
    };
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      const { data, error } = await supabase.rpc('get_project_basic_data', {
        p_project_id: projectId
      });

      if (error) throw error;
      setProjectData(data?.[0] || null);
    } catch (error) {
      console.error('Error loading project data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project data',
        variant: 'destructive',
      });
    }
  };

  const loadProjectStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_project_overview_stats', {
        p_project_id: projectId
      });

      if (error) {
        console.error('Stats RPC error:', error);
        // Set default stats if RPC fails
        setStats({
          total_tasks: 0,
          completed_tasks: 0,
          upcoming_deadlines: 0,
          unread_messages: 0,
          files_shared: 0,
          team_members: 0,
          overall_progress: 0,
          current_milestone: 'initial_brief',
          next_deadline: 'TBD',
          estimated_completion: 'TBD'
        });
      } else if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error) {
      console.error('Error loading project stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const { data, error } = await supabase.rpc('get_project_activity_log', {
        p_project_id: projectId
      });

      if (error) throw error;

      const formattedActivity = (data || []).map((log: any) => ({
        id: log.id,
        action: log.title,
        description: log.description,
        time: log.created_at,
        user: log.created_by_name,
        type: log.activity_type,
      }));

      setRecentActivity(formattedActivity);
    } catch (error) {
      console.error('Error loading activity:', error);
      setRecentActivity([]);
    }
  };

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-8 bg-muted rounded w-1/2" />
                <div className="h-2 bg-muted rounded w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Project Progress
          </CardTitle>
          <CardDescription>
            Current milestone: {stats.current_milestone}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm font-bold text-primary">
                {stats.overall_progress}%
              </span>
            </div>
            <Progress value={stats.overall_progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {stats.completed_tasks}/{stats.total_tasks}
              </div>
              <div className="text-xs text-muted-foreground">Tasks</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold text-foreground">
                {stats.current_milestone}
              </div>
              <div className="text-xs text-muted-foreground">Milestone</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold text-foreground">
                {stats.next_deadline}
              </div>
              <div className="text-xs text-muted-foreground">Next Deadline</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.unread_messages}</div>
                <div className="text-sm text-muted-foreground">New Messages</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.files_shared}</div>
                <div className="text-sm text-muted-foreground">Files Shared</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.upcoming_deadlines}</div>
                <div className="text-sm text-muted-foreground">Upcoming Deadlines</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.team_members}</div>
                <div className="text-sm text-muted-foreground">Team Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest project updates</CardDescription>
            </div>
            {recentActivity.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={() => toast({
                  title: 'Activity Log',
                  description: 'Full activity log feature coming soon',
                })}
              >
                View all activity →
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>{format(new Date(activity.time), 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {projectData?.start_date && projectData?.estimated_completion ? (
              <>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-medium">{format(new Date(projectData.start_date), 'MMMM d, yyyy')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Estimated Completion</p>
                  <p className="text-sm font-medium">{format(new Date(projectData.estimated_completion), 'MMMM d, yyyy')}</p>
                </div>
                <div className="pt-2">
                  {(() => {
                    const today = new Date();
                    const endDate = new Date(projectData.estimated_completion);
                    const startDate = new Date(projectData.start_date);
                    const totalDays = differenceInDays(endDate, startDate);
                    const daysRemaining = differenceInDays(endDate, today);
                    const progressPercentage = totalDays > 0 ? Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100)) : 0;
                    
                    return (
                      <>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-muted-foreground">Time Remaining</span>
                          <span className="font-medium">{daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </>
                    );
                  })()}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No timeline set</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {projectData?.budget_total ? (
              <>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Budget Used</p>
                  <p className="text-2xl font-bold">${(projectData.budget_used || 0).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-sm font-medium text-muted-foreground">
                    ${(projectData.budget_total - (projectData.budget_used || 0)).toLocaleString()}
                  </p>
                </div>
                <div className="pt-2">
                  {(() => {
                    const percentage = (((projectData.budget_used || 0) / projectData.budget_total) * 100);
                    return (
                      <>
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">{percentage.toFixed(0)}% of total budget</p>
                      </>
                    );
                  })()}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No budget set</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectOverview;
