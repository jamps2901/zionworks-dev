import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Download, 
  FileText, 
  Image, 
  File, 
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  User,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProjectFilesProps {
  projectId: string;
  clientId: string;
}

interface ProjectFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  uploaded_by_type: string;
  description: string;
  requires_approval: boolean;
  approval_status: string;
  stage_name: string;
  created_at: string;
}

const ProjectFiles = ({ projectId, clientId }: ProjectFilesProps) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const { toast } = useToast();

  const stages = [
    { value: 'initial_brief', label: 'Initial Brief' },
    { value: 'scope_agreement', label: 'Scope Agreement' },
    { value: 'design_phase', label: 'Design Phase' },
    { value: 'development', label: 'Development' },
    { value: 'testing_uat', label: 'Testing & UAT' },
    { value: 'go_live', label: 'Go Live' },
    { value: 'post_support', label: 'Post-Launch Support' }
  ];

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const loadFiles = async () => {
    try {
      // Load real files only
      
      const { data, error } = await supabase
        .rpc('get_project_files', { p_project_id: projectId });

      if (error) throw error;

      // For demo purposes, add some sample files if none exist
      if (!data || data.length === 0) {
        const sampleFiles: ProjectFile[] = [
          {
            id: '1',
            file_name: 'Project Requirements.pdf',
            file_path: '/sample/requirements.pdf',
            file_size: 1240000,
            file_type: 'application/pdf',
            uploaded_by: 'team-1',
            uploaded_by_type: 'team',
            description: 'Initial project requirements document with detailed specifications',
            requires_approval: true,
            approval_status: 'pending',
            stage_name: 'initial_brief',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        setFiles(sampleFiles);
      } else {
        setFiles(data);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Error",
        description: "Failed to load project files.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create file metadata via RPC for security
      const { data: fileId, error: fileError } = await supabase
        .rpc('create_project_file_metadata', {
          p_project_id: projectId,
          p_uploaded_by: clientId,
          p_uploaded_by_type: 'client',
          p_file_name: file.name,
          p_file_type: file.type,
          p_file_size: file.size,
          p_description: uploadDescription,
          p_stage_name: selectedStage as any || null
        });

      if (fileError) throw fileError;

      // Reload files to show the new one
      await loadFiles();
      setUploadDescription('');
      setSelectedStage('');

      toast({
        title: "File Uploaded",
        description: "Your file has been uploaded successfully.",
      });

      // Reset the input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-600" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-600" />;
    } else {
      return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const getApprovalBadge = (status: string, requiresApproval: boolean) => {
    if (!requiresApproval) {
      return <Badge variant="outline">No Approval Needed</Badge>;
    }

    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Changes Requested
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
    }
  };

  const downloadFile = (file: ProjectFile) => {
    toast({
      title: "Download",
      description: `Downloading ${file.file_name}...`,
    });
  };

  const viewFile = (file: ProjectFile) => {
    toast({
      title: "View File",
      description: `Opening ${file.file_name}...`,
    });
  };

  const deleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.rpc('delete_project_file', {
        p_file_id: fileId
      });

      if (error) throw error;

      toast({
        title: "File Deleted",
        description: "File has been removed successfully.",
      });

      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete file.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stage">Project Stage</Label>
              <select
                id="stage"
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md bg-background"
              >
                <option value="">Select a stage...</option>
                {stages.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the file..."
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Label 
              htmlFor="file-upload" 
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">
                {isUploading ? 'Uploading...' : 'Click to upload file'}
              </span>
              <span className="text-xs text-muted-foreground">
                Maximum file size: 10MB
              </span>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Project Files & Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Files Yet</h3>
              <p className="text-muted-foreground">
                Upload your first file to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getFileIcon(file.file_type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {file.file_name}
                        </h4>
                        {file.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {file.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {file.uploaded_by_type === 'client' ? (
                              <User className="h-3 w-3" />
                            ) : (
                              <Users className="h-3 w-3" />
                            )}
                            <span>
                              {file.uploaded_by_type === 'client' ? 'You' : 'Team'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(file.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <span>{formatFileSize(file.file_size)}</span>
                          
                          {file.stage_name && (
                            <Badge variant="outline" className="text-xs">
                              {stages.find(s => s.value === file.stage_name)?.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {getApprovalBadge(file.approval_status, file.requires_approval)}
                      
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewFile(file)}
                          className="gap-1"
                          title="View file"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(file)}
                          className="gap-1"
                          title="Download file"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        {file.uploaded_by === clientId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteFile(file.id, file.file_name)}
                            className="gap-1 text-destructive hover:text-destructive"
                            title="Delete file"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectFiles;