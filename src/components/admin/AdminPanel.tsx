import { useState, useEffect } from 'react';
import { 
  Home, 
  MessageSquare, 
  MessageCircle,
  DollarSign, 
  Calendar, 
  LogOut,
  Menu,
  X,
  Settings,
  Edit,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminAuthProvider, useAdminAuth } from './AdminAuth';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import QuotesManager from './QuotesManager';
import ContactsManager from './ContactsManager';
import BookingsManager from './BookingsManager';
import ServicesManager from './ServicesManager';
import AdminSettings from './AdminSettings';
import BlogManager from './BlogManager';
import LiveChatManager from './LiveChatManager';
import IntakeManager from './IntakeManager';
import ClientManager from './ClientManager';

type AdminSection = 'dashboard' | 'intake' | 'client-management' | 'live-chat' | 'quotes' | 'contacts' | 'bookings' | 'blog' | 'services' | 'settings';

const AdminPanel = () => {
  return (
    <AdminAuthProvider>
      <AdminPanelContent />
    </AdminAuthProvider>
  );
};

const AdminPanelContent = () => {
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading, signOut, user } = useAdminAuth();
  
  const adminEmail = user?.email || localStorage.getItem('zionworks_admin_email') || 'Admin';

  const handleLogin = (authenticated: boolean, email?: string) => {
    if (authenticated) {
      setCurrentSection('dashboard');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentSection('dashboard');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'intake', label: 'Client Intake', icon: UserPlus },
    { id: 'client-management', label: 'Client Management', icon: Settings },
    { id: 'live-chat', label: 'Live Chat', icon: MessageCircle },
    { id: 'quotes', label: 'Quote Requests', icon: DollarSign },
    { id: 'contacts', label: 'Contact Messages', icon: MessageSquare },
    { id: 'bookings', label: 'Consultations', icon: Calendar },
    { id: 'blog', label: 'Blog Posts', icon: Edit },
    { id: 'services', label: 'Services', icon: Settings },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'intake':
        return <IntakeManager />;
      case 'client-management':
        return <ClientManager />;
      case 'live-chat':
        return <LiveChatManager />;
      case 'quotes':
        return <QuotesManager />;
      case 'contacts':
        return <ContactsManager />;
      case 'bookings':
        return <BookingsManager />;
      case 'blog':
        return <BlogManager />;
      case 'services':
        return <ServicesManager />;
      case 'settings':
        return <AdminSettings adminEmail={adminEmail} />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-primary">Zion Works Admin</h2>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Admin Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={currentSection === item.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setCurrentSection(item.id as AdminSection);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="mr-3 w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold text-primary capitalize">
                 {currentSection === 'dashboard' ? 'Dashboard' : 
                 currentSection === 'intake' ? 'Client Intake' :
                 currentSection === 'client-management' ? 'Client Management' :
                 currentSection === 'live-chat' ? 'Live Chat' :
                 currentSection === 'quotes' ? 'Quote Requests' :
                 currentSection === 'contacts' ? 'Contact Messages' : 
                 currentSection === 'bookings' ? 'Consultations' :
                 currentSection === 'blog' ? 'Blog Posts' :
                 currentSection === 'services' ? 'Services' :
                 currentSection === 'settings' ? 'Settings' : 
                 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome back, {adminEmail}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">
          {renderCurrentSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;