import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Paperclip,
  CalendarClock,
  RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  stage_name: string;
  description?: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  requires_approval: boolean;
  uploaded_by_type: string;
  created_at: string;
}

interface DocumentManagerProps {
  projectId: string;
  clientId: string;
  currentStage: string;
}

const DocumentManager = ({ projectId, clientId, currentStage }: DocumentManagerProps) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const loadFiles = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      
      // Check if this is a demo project
      if (projectId.startsWith('demo-')) {
        // For demo projects, create demo files without database calls
        const demoFiles: ProjectFile[] = [
          {
            id: '1',
            file_name: 'Project_Requirements_v1.2.pdf',
            file_path: '/demo/requirements.pdf',
            file_type: 'application/pdf',
            file_size: 2048576,
            stage_name: 'requirements_gathering',
            description: 'Detailed project requirements and specifications',
            approval_status: 'approved',
            requires_approval: true,
            uploaded_by_type: 'admin',
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            file_name: 'Statement_of_Work_v3.1.pdf',
            file_path: '/demo/sow.pdf',
            file_type: 'application/pdf',
            file_size: 1536000,
            stage_name: 'sow_upload_signoff',
            description: 'Final statement of work document for client approval',
            approval_status: 'approved',
            requires_approval: true,
            uploaded_by_type: 'admin',
            created_at: '2024-01-22T09:15:00Z'
          },
          {
            id: '3',
            file_name: 'UI_Design_System_v2.0.figma',
            file_path: '/demo/design-system.figma',
            file_type: 'application/figma',
            file_size: 15728640,
            stage_name: 'design',
            description: 'Complete design system with components and guidelines',
            approval_status: 'pending',
            requires_approval: true,
            uploaded_by_type: 'admin',
            created_at: '2024-02-01T14:15:00Z'
          },
          {
            id: '4',
            file_name: 'Wireframes_Mobile_Desktop.sketch',
            file_path: '/demo/wireframes.sketch',
            file_type: 'application/sketch',
            file_size: 8960000,
            stage_name: 'design',
            description: 'High-fidelity wireframes for mobile and desktop versions',
            approval_status: 'revision_requested',
            requires_approval: true,
            uploaded_by_type: 'admin',
            created_at: '2024-02-03T11:20:00Z'
          },
          {
            id: '5',
            file_name: 'Technical_Architecture_Doc.pdf',
            file_path: '/demo/tech-arch.pdf',
            file_type: 'application/pdf',
            file_size: 3072000,
            stage_name: 'development',
            description: 'Technical architecture and database design documentation',
            approval_status: 'pending',
            requires_approval: true,
            uploaded_by_type: 'admin',
            created_at: '2024-02-10T16:30:00Z'
          },
          {
            id: '6',
            file_name: 'Client_Feedback_Round_2.docx',
            file_path: '/demo/feedback-r2.docx',
            file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            file_size: 1024000,
            stage_name: 'development',
            description: 'Client feedback on development progress and feature requests',
            approval_status: 'pending',
            requires_approval: false,
            uploaded_by_type: 'client',
            created_at: '2024-02-12T09:45:00Z'
          },
          {
            id: '7',
            file_name: 'Brand_Guidelines_Final.pdf',
            file_path: '/demo/brand-guidelines.pdf',
            file_type: 'application/pdf',
            file_size: 4096000,
            stage_name: 'design',
            description: 'Complete brand guidelines including logo usage, colors, and typography',
            approval_status: 'approved',
            requires_approval: true,
            uploaded_by_type: 'admin',
            created_at: '2024-01-28T13:00:00Z'
          }
        ];
        setFiles(demoFiles);
        return;
      }
      
      const { data, error } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading files:', error);
        // Fallback to demo files
        const demoFiles: ProjectFile[] = [
          {
            id: '1',
            file_name: 'Project_Requirements_v1.2.pdf',
            file_path: '/demo/requirements.pdf',
            file_type: 'application/pdf',
            file_size: 2048576,
            stage_name: 'requirements_gathering',
            description: 'Detailed project requirements and specifications',
            approval_status: 'approved',
            requires_approval: true,
            uploaded_by_type: 'admin',
            created_at: '2024-01-15T10:30:00Z'
          }
        ];
        setFiles(demoFiles);
      } else {
        setFiles(data || []);
      }
    } catch (error) {
      console.error('Error in loadFiles:', error);
      toast({
        title: "Error",
        description: "Failed to load project files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      // In a real implementation, you would upload to Supabase Storage
      // For demo purposes, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create file record
      const newFile: ProjectFile = {
        id: Date.now().toString(),
        file_name: file.name,
        file_path: `/uploads/${projectId}/${file.name}`,
        file_type: file.type,
        file_size: file.size,
        stage_name: currentStage,
        description,
        approval_status: 'pending',
        requires_approval: false,
        uploaded_by_type: 'client',
        created_at: new Date().toISOString()
      };

      setFiles(prev => [newFile, ...prev]);
      setDescription('');
      
      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully`,
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('figma')) return '🎨';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getApprovalStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'revision_requested':
        return <Badge className="bg-orange-500 text-white"><RotateCcw className="h-3 w-3 mr-1" />Revision Requested</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const groupedFiles = files.reduce((acc, file) => {
    const stage = file.stage_name;
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(file);
    return acc;
  }, {} as Record<string, ProjectFile[]>);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents
          </CardTitle>
          <CardDescription>
            Upload project documents for the current stage: {currentStage.replace('_', ' ')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="file-description" className="text-sm font-medium mb-2 block">
              Description (optional)
            </label>
            <Textarea
              id="file-description"
              placeholder="Describe the purpose of this document..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar"
            />
            <Button disabled={uploading} variant="outline">
              <Paperclip className="h-4 w-4 mr-2" />
              Browse
            </Button>
          </div>
          
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, DOC, XLS, PPT, Images, ZIP (Max 10MB)
          </p>
        </CardContent>
      </Card>

      {/* Files by Stage */}
      <div className="space-y-6">
        {Object.entries(groupedFiles).map(([stage, stageFiles]) => (
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg capitalize">
                  {stage.replace('_', ' ')} Documents
                </CardTitle>
                <CardDescription>
                  {stageFiles.length} file{stageFiles.length !== 1 ? 's' : ''} in this stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stageFiles.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="text-2xl flex-shrink-0">
                          {getFileIcon(file.file_type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate text-foreground">
                              {file.file_name}
                            </h4>
                            {file.requires_approval && getApprovalStatus(file.approval_status)}
                          </div>
                          
                          {file.description && (
                            <p className="text-sm text-muted-foreground mb-1 truncate">
                              {file.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarClock className="h-3 w-3" />
                              {formatDate(file.created_at)}
                            </span>
                            <span>{formatFileSize(file.file_size)}</span>
                            <Badge variant="outline" className="text-xs">
                              {file.uploaded_by_type === 'client' ? 'Client' : 'Team'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {files.length === 0 && (
        <Card className="text-center p-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Documents Yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first document to get started with project collaboration.
          </p>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </Card>
      )}
    </div>
  );
};

export default DocumentManager;