import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, Star, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  member_name: string;
  role: string;
  email?: string;
  phone?: string;
  is_primary_contact: boolean;
}

interface TeamPanelProps {
  projectId: string;
}

const TeamPanel = ({ projectId }: TeamPanelProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTeamMembers();
  }, [projectId]);

  const loadTeamMembers = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      
      // Load real team members using secure RPC
      const { data, error } = await supabase
        .rpc('get_project_team_members', { p_project_id: projectId });

      if (error) {
        console.error('Error loading team members:', error);
        setTeamMembers([]);
        return;
      }

      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error in loadTeamMembers:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Project Manager': 'bg-primary text-primary-foreground',
      'Lead Developer': 'bg-blue-500 text-white',
      'UI/UX Designer': 'bg-purple-500 text-white',
      'QA Engineer': 'bg-green-500 text-white',
      'Business Analyst': 'bg-orange-500 text-white',
      'DevOps Engineer': 'bg-red-500 text-white'
    };
    return colors[role] || 'bg-secondary text-secondary-foreground';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Project Team</h3>
        <Badge variant="secondary" className="ml-auto">
          {teamMembers.length} Members
        </Badge>
      </div>

      <div className="space-y-4">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`transition-all duration-200 hover:shadow-md ${
              member.is_primary_contact ? 'ring-2 ring-primary/20' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                        {getInitials(member.member_name)}
                      </AvatarFallback>
                    </Avatar>
                    {member.is_primary_contact && (
                      <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                        <Star className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground truncate">
                        {member.member_name}
                      </h4>
                      {member.is_primary_contact && (
                        <Badge variant="outline" className="text-xs">
                          Primary Contact
                        </Badge>
                      )}
                    </div>
                    
                    <Badge className={`text-xs mb-2 ${getRoleColor(member.role)}`}>
                      {member.role}
                    </Badge>
                    
                    <div className="space-y-1">
                      {member.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <a 
                            href={`mailto:${member.email}`}
                            className="hover:text-primary transition-colors truncate"
                          >
                            {member.email}
                          </a>
                        </div>
                      )}
                      
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <a 
                            href={`tel:${member.phone}`}
                            className="hover:text-primary transition-colors"
                          >
                            {member.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <Card className="text-center p-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Team Members</h3>
          <p className="text-muted-foreground">
            Team members will be assigned to your project soon.
          </p>
        </Card>
      )}
    </div>
  );
};

export default TeamPanel;