import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  User, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Activity,
  Bell,
  Settings,
  Home,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProjectTimeline from './ProjectTimeline';
import ProjectMessages from './ProjectMessages';
import ProjectFiles from './ProjectFiles';
import TeamPanel from './TeamPanel';
import ProjectCalendar from './ProjectCalendar';
import ClientSettings from './ClientSettings';
import NotificationCenter from './NotificationCenter';
import ProjectOverview from './ProjectOverview';
import { Link } from 'react-router-dom';

interface ClientDashboardProps {
  client: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone?: string;
  };
  onLogout: () => void;
}

interface Project {
  id: string;
  project_name: string;
  description: string;
  current_stage: string;
  start_date: string;
  estimated_completion: string;
  created_at: string;
}

const ClientDashboard = ({ client, onLogout }: ClientDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, [client.id]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_client_projects', { p_client_id: client.id });


      if (error) {
        console.error('Error loading projects:', error);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive"
        });
        setProjects([]);
        setSelectedProject(null);
        return;
      }

      // Only show actual client projects, no demo data
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
      } else {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Error in loadProjects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please contact support.",
        variant: "destructive"
      });
      setProjects([]);
      setSelectedProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStageDisplay = (stage: string) => {
    const stageMap: Record<string, string> = {
      'kick_off': 'Kick-off',
      'requirements_gathering': 'Requirements Gathering', 
      'sow_upload_signoff': 'SOW Upload & Sign-off',
      'design': 'Design',
      'development': 'Development',
      'testing': 'Testing',
      'uat': 'User Acceptance Testing',
      'go_live': 'Go Live',
      'post_go_live_support': 'Post Go-Live Support',
      // Handle demo stage names
      'initial_brief': 'Initial Brief',
      'project_brief': 'Project Brief'
    };
    return stageMap[stage] || stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
    setUnreadNotifications(0); // Mark as viewed
  };

  const handleClientUpdate = () => {
    // Refresh client data after settings update
    loadProjects();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'team', label: 'Team', icon: User },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'files', label: 'Files', icon: FileText }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50 backdrop-blur-sm bg-card/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4" />
                ZionWorks
              </Link>
              <div className="h-4 w-px bg-border" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Welcome, {client.contact_name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {client.company_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleNotificationClick}
                  className="relative"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {unreadNotifications}
                    </div>
                  )}
                </Button>
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <NotificationCenter 
                      clientId={client.id} 
                      onClose={() => setShowNotifications(false)} 
                    />
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={handleSettingsClick}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                onClick={onLogout} 
                variant="outline" 
                size="sm"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Settings</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                <ClientSettings client={client} onUpdate={handleClientUpdate} />
              </div>
            </div>
          </div>
        )}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Welcome! No Active Projects Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You don't have any active projects assigned yet. Your team will assign one shortly and you'll receive a confirmation email with project details.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Need assistance? Contact your project manager.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Project Selection */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedProject?.id === project.id 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold line-clamp-1">
                          {project.project_name}
                        </CardTitle>
                        <Badge variant="secondary" className="ml-2 shrink-0">
                          {getStageDisplay(project.current_stage)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Started: {formatDate(project.start_date || project.created_at)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {selectedProject && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Project Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold">
                          {selectedProject.project_name}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">
                          {selectedProject.description}
                        </p>
                      </div>
                      <Badge variant="default" className="text-sm">
                        {getStageDisplay(selectedProject.current_stage)}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
                  {tabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab(tab.id)}
                      className="gap-2"
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </Button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[500px]">
                  {activeTab === 'overview' && (
                    <ProjectOverview projectId={selectedProject.id} clientId={client.id} />
                  )}
                  {activeTab === 'timeline' && (
                    <ProjectTimeline projectId={selectedProject.id} clientId={client.id} />
                  )}
                  {activeTab === 'team' && (
                    <TeamPanel projectId={selectedProject.id} />
                  )}
                  {activeTab === 'calendar' && (
                    <ProjectCalendar projectId={selectedProject.id} clientId={client.id} />
                  )}
                  {activeTab === 'messages' && (
                    <ProjectMessages projectId={selectedProject.id} clientId={client.id} clientName={client.contact_name} />
                  )}
                  {activeTab === 'files' && (
                    <ProjectFiles projectId={selectedProject.id} clientId={client.id} />
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;