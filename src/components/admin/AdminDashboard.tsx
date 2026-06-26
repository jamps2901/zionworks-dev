import { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp,
  Mail,
  Phone,
  DollarSign,
  UserPlus
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalQuotes: number;
  totalContacts: number;
  totalBookings: number;
  recentQuotes: any[];
  recentContacts: any[];
  recentBookings: any[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotes: 0,
    totalContacts: 0,
    totalBookings: 0,
    recentQuotes: [],
    recentContacts: [],
    recentBookings: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Get total counts using secure admin functions
      const [quotesResponse, contactsResponse, bookingsResponse] = await Promise.all([
        supabase.rpc('get_admin_quotes'),
        supabase.rpc('get_admin_contacts'), 
        supabase.rpc('get_admin_bookings')
      ]);

      // Get recent items (last 5) from the secure functions
      const allQuotes = quotesResponse.data || [];
      const allContacts = contactsResponse.data || [];
      const allBookings = bookingsResponse.data || [];

      setStats({
        totalQuotes: allQuotes.length,
        totalContacts: allContacts.length,
        totalBookings: allBookings.length,
        recentQuotes: allQuotes.slice(0, 5),
        recentContacts: allContacts.slice(0, 5),
        recentBookings: allBookings.slice(0, 5)
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBudgetLabel = (budget: string) => {
    const labels = {
      'small': '$2,000 - $5,000',
      'medium': '$5,000 - $15,000',
      'large': '$15,000 - $50,000',
      'enterprise': '$50,000+'
    };
    return labels[budget] || budget;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Quotes</p>
              <p className="text-3xl font-bold text-primary">{stats.totalQuotes}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                Active inquiries
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact Messages</p>
              <p className="text-3xl font-bold text-primary">{stats.totalContacts}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <Mail className="w-4 h-4 mr-1" />
                Total received
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Consultations Booked</p>
              <p className="text-3xl font-bold text-primary">{stats.totalBookings}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                Scheduled meetings
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Recent Quote Requests</h3>
          {stats.recentQuotes.length === 0 ? (
            <p className="text-muted-foreground">No quotes yet</p>
          ) : (
            <div className="space-y-4">
              {stats.recentQuotes.map((quote) => (
                <div key={quote.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-primary">{quote.name}</p>
                      <p className="text-sm text-muted-foreground">{quote.email}</p>
                      <p className="text-sm text-secondary font-medium">
                        {quote.project_type} • {getBudgetLabel(quote.budget)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(quote.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Bookings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Recent Consultations</h3>
          {stats.recentBookings.length === 0 ? (
            <p className="text-muted-foreground">No bookings yet</p>
          ) : (
            <div className="space-y-4">
              {stats.recentBookings.map((booking) => (
                <div key={booking.id} className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-primary">{booking.name}</p>
                      <p className="text-sm text-muted-foreground">{booking.email}</p>
                      <p className="text-sm text-secondary font-medium">
                        {booking.method} • {formatDate(booking.preferred_time)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(booking.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Contacts */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Recent Contact Messages</h3>
        {stats.recentContacts.length === 0 ? (
          <p className="text-muted-foreground">No contact messages yet</p>
        ) : (
          <div className="space-y-4">
            {stats.recentContacts.map((contact) => (
              <div key={contact.id} className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <p className="font-medium text-primary">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                      {contact.phone && (
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {contact.phone}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">{contact.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-4">{formatDate(contact.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;