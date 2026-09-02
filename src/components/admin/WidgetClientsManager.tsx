import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, AlertCircle, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WidgetClient {
  id: string;
  slug: string;
  business_name: string;
  allowed_origins: string[];
  system_prompt: string;
  bot_display_name: string;
  primary_color: string;
  welcome_message: string;
  openai_model: string;
  is_active: boolean;
  created_at: string;
}

const emptyForm = {
  slug: '',
  business_name: '',
  allowed_origins: '',
  system_prompt: '',
  bot_display_name: 'Assistant',
  primary_color: '#2563eb',
  welcome_message: 'Hi! How can I help?',
  openai_model: 'gpt-5-2025-08-07',
  is_active: true,
};

const WidgetClientsManager = () => {
  const [clients, setClients] = useState<WidgetClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<WidgetClient | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_admin_widget_clients');

      if (error) throw error;

      setClients(data || []);
    } catch (err) {
      console.error('Error fetching widget clients:', err);
      setError('Failed to fetch widget clients');
      toast({
        title: "Error",
        description: "Failed to fetch widget clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const originsArray = formData.allowed_origins
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    try {
      if (editingClient) {
        const { error } = await supabase.rpc('update_admin_widget_client', {
          p_id: editingClient.id,
          p_slug: formData.slug,
          p_business_name: formData.business_name,
          p_allowed_origins: originsArray,
          p_system_prompt: formData.system_prompt,
          p_bot_display_name: formData.bot_display_name,
          p_primary_color: formData.primary_color,
          p_welcome_message: formData.welcome_message,
          p_openai_model: formData.openai_model,
          p_is_active: formData.is_active,
        });

        if (error) throw error;

        toast({ title: "Success", description: "Widget client updated" });
      } else {
        const { error } = await supabase.rpc('create_admin_widget_client', {
          p_slug: formData.slug,
          p_business_name: formData.business_name,
          p_allowed_origins: originsArray,
          p_system_prompt: formData.system_prompt,
          p_bot_display_name: formData.bot_display_name,
          p_primary_color: formData.primary_color,
          p_welcome_message: formData.welcome_message,
          p_openai_model: formData.openai_model,
        });

        if (error) throw error;

        toast({ title: "Success", description: "Widget client created" });
      }

      setDialogOpen(false);
      resetForm();
      fetchClients();
    } catch (err) {
      console.error('Error saving widget client:', err);
      toast({
        title: "Error",
        description: "Failed to save widget client -- check the slug isn't already in use",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, businessName: string) => {
    if (!confirm(`Are you sure you want to delete the widget for "${businessName}"? This will break their embed immediately.`)) return;

    try {
      const { error } = await supabase.rpc('delete_admin_widget_client', { p_id: id });

      if (error) throw error;

      toast({ title: "Success", description: "Widget client deleted" });
      fetchClients();
    } catch (err) {
      console.error('Error deleting widget client:', err);
      toast({
        title: "Error",
        description: "Failed to delete widget client",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (client: WidgetClient) => {
    setEditingClient(client);
    setFormData({
      slug: client.slug,
      business_name: client.business_name,
      allowed_origins: client.allowed_origins.join(', '),
      system_prompt: client.system_prompt,
      bot_display_name: client.bot_display_name,
      primary_color: client.primary_color,
      welcome_message: client.welcome_message,
      openai_model: client.openai_model,
      is_active: client.is_active,
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingClient(null);
    resetForm();
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingClient(null);
  };

  const copyEmbedSnippet = (slug: string) => {
    const snippet = `<iframe src="https://zionworks.dev/w/${slug}" style="position:fixed;bottom:20px;right:20px;width:380px;height:560px;border:0;z-index:9999" loading="lazy"></iframe>`;
    navigator.clipboard.writeText(snippet);
    toast({ title: "Copied", description: "Embed snippet copied to clipboard" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading widget clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Widget Clients</h1>
          <p className="text-muted-foreground">Manage embeddable AI chat widgets for client sites</p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Widget Client
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Widget Clients ({clients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No widget clients yet. Add your first pilot client to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Allowed Origins</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.business_name}</TableCell>
                      <TableCell className="font-mono text-xs">{client.slug}</TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                        {client.allowed_origins.join(', ') || '(none set)'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.is_active ? 'secondary' : 'outline'}>
                          {client.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyEmbedSnippet(client.slug)}
                            title="Copy embed snippet"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(client)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(client.id, client.business_name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Edit Widget Client' : 'Add New Widget Client'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (used in embed URL, e.g. "kc-electrical")</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                required
              />
            </div>
            <div>
              <Label htmlFor="allowed_origins">Allowed Origins (comma-separated, must match exactly)</Label>
              <Input
                id="allowed_origins"
                value={formData.allowed_origins}
                onChange={(e) => setFormData({ ...formData, allowed_origins: e.target.value })}
                placeholder="https://theirsite.co.nz, https://www.theirsite.co.nz"
                required
              />
            </div>
            <div>
              <Label htmlFor="bot_display_name">Assistant Display Name</Label>
              <Input
                id="bot_display_name"
                value={formData.bot_display_name}
                onChange={(e) => setFormData({ ...formData, bot_display_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="welcome_message">Welcome Message</Label>
              <Input
                id="welcome_message"
                value={formData.welcome_message}
                onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="primary_color">Primary Color</Label>
              <Input
                id="primary_color"
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="h-10 w-20 p-1"
              />
            </div>
            <div>
              <Label htmlFor="system_prompt">System Prompt (defines the assistant's persona and knowledge)</Label>
              <Textarea
                id="system_prompt"
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                required
                rows={6}
                placeholder="You are a helpful assistant for [business]. You answer questions about..."
              />
            </div>
            {editingClient && (
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingClient ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WidgetClientsManager;
