import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Mail, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Quote {
  id: number;
  created_at: string;
  name: string;
  email: string;
  project_type: string;
  timeline: string;
  budget: string;
  message: string;
}

const QuotesManager = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('get_admin_quotes');
      
      if (error) {
        throw error;
      }
      
      setQuotes(data || []);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError('Failed to fetch quotes');
      toast({
        title: "Error",
        description: "Failed to fetch quotes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProjectTypeLabel = (type: string) => {
    switch (type) {
      case 'website':
        return 'Website';
      case 'app':
        return 'Mobile App';
      case 'ai':
        return 'AI Solution';
      case 'custom':
        return 'Custom Software';
      default:
        return type;
    }
  };

  const getTimelineLabel = (timeline: string) => {
    switch (timeline) {
      case 'urgent':
        return '2-4 weeks';
      case 'standard':
        return '1-2 months';
      case 'flexible':
        return '3+ months';
      default:
        return timeline;
    }
  };

  const getBudgetLabel = (budget: string) => {
    switch (budget) {
      case 'small':
        return '$2,000 - $5,000';
      case 'medium':
        return '$5,000 - $15,000';
      case 'large':
        return '$15,000 - $50,000';
      case 'enterprise':
        return '$50,000+';
      default:
        return budget;
    }
  };

  const getBudgetColor = (budget: string) => {
    switch (budget) {
      case 'small':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'medium':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'large':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading quotes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quote Requests</h1>
          <p className="text-muted-foreground">Manage your project quote requests</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {quotes.length} Total
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Quotes ({quotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No quote requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Project Type</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{quote.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <a 
                              href={`mailto:${quote.email}`}
                              className="text-secondary hover:text-secondary/80 transition-colors text-sm"
                            >
                              {quote.email}
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getProjectTypeLabel(quote.project_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{getTimelineLabel(quote.timeline)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getBudgetColor(quote.budget)}`}
                          >
                            {getBudgetLabel(quote.budget)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          {quote.message ? (
                            <p className="text-sm text-muted-foreground line-clamp-2" title={quote.message}>
                              {quote.message}
                            </p>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">No message</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(quote.created_at).toLocaleDateString('en-NZ')}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotesManager;