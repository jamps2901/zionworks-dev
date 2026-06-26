import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, CheckCircle, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay } from 'date-fns';

interface ProjectEvent {
  id: string;
  event_title: string;
  event_description: string;
  event_type: string;
  event_date: string;
  event_end_date?: string;
  event_location?: string;
  status: string;
  created_by_type: string;
  attendees?: string[];
}

interface ProjectCalendarAdminProps {
  projectId: string;
}

const eventTypeColors: { [key: string]: string } = {
  'meeting': 'bg-blue-500',
  'deadline': 'bg-red-500',
  'milestone': 'bg-green-500',
  'review': 'bg-purple-500',
  'other': 'bg-gray-500'
};

const ADMIN_ID = '00000000-0000-0000-0000-000000000000';

const ProjectCalendarAdmin = ({ projectId }: ProjectCalendarAdminProps) => {
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ProjectEvent | null>(null);
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'meeting',
    date: new Date(),
    location: ''
  });

  useEffect(() => {
    loadEvents();

    // Set up realtime subscription
    const channel = supabase
      .channel('admin-project-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_events',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_project_events', {
        p_project_id: projectId
      });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calendar events',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase.rpc('create_project_event', {
        p_project_id: projectId,
        p_event_title: newEvent.title,
        p_event_description: newEvent.description,
        p_event_type: newEvent.type,
        p_event_date: newEvent.date.toISOString(),
        p_event_location: newEvent.location || null,
        p_created_by: ADMIN_ID,
        p_created_by_type: 'admin',
        p_status: 'confirmed'
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Event created successfully'
      });

      setShowNewEventDialog(false);
      setNewEvent({
        title: '',
        description: '',
        type: 'meeting',
        date: new Date(),
        location: ''
      });
      loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const updateEventStatus = async (eventId: string, status: string) => {
    try {
      const { error } = await supabase.rpc('update_project_event_status', {
        p_event_id: eventId,
        p_status: status
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Event ${status === 'confirmed' ? 'confirmed' : 'cancelled'}`
      });

      loadEvents();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error updating event status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event status',
        variant: 'destructive'
      });
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.event_date), date)
    );
  };

  const getDatesWithEvents = () => {
    return events.map(event => new Date(event.event_date));
  };

  const getConfirmedDates = () => {
    return events
      .filter(event => event.status === 'confirmed')
      .map(event => new Date(event.event_date));
  };

  const eventsForSelectedDate = getEventsForDate(selectedDate);
  const upcomingEvents = events
    .filter(event => new Date(event.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Calendar</h3>
        <Button onClick={() => setShowNewEventDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={{
                hasEvent: getDatesWithEvents(),
                confirmed: getConfirmedDates()
              }}
              modifiersStyles={{
                hasEvent: { fontWeight: 'bold', textDecoration: 'underline' },
                confirmed: { backgroundColor: 'hsl(var(--primary) / 0.2)', borderRadius: '0.375rem' }
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Events for selected date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Events on {format(selectedDate, 'MMM dd, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {eventsForSelectedDate.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No events scheduled
                </p>
              ) : (
                eventsForSelectedDate.map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${eventTypeColors[event.event_type] || eventTypeColors.other}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.event_title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.event_date), 'h:mm a')}
                        </p>
                        <Badge 
                          variant={event.status === 'confirmed' ? 'default' : event.status === 'pending' ? 'secondary' : 'outline'}
                          className="text-xs mt-1"
                        >
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming events list */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming events
              </p>
            ) : (
              upcomingEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${eventTypeColors[event.event_type] || eventTypeColors.other}`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{event.event_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.event_date), 'PPP • h:mm a')}
                        </p>
                      </div>
                      <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                    {event.event_location && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.event_location}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Event Dialog */}
      <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule New Event</DialogTitle>
            <DialogDescription>
              Create a new event for the project calendar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Event Title *</Label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="e.g., Project Kickoff Meeting"
              />
            </div>
            <div>
              <Label>Event Type</Label>
              <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date & Time *</Label>
              <Input
                type="datetime-local"
                value={format(newEvent.date, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="e.g., Zoom, Office, etc."
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Event details..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={createEvent} disabled={isCreating} className="flex-1">
                {isCreating ? 'Creating...' : 'Create Event'}
              </Button>
              <Button variant="outline" onClick={() => setShowNewEventDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.event_title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <Badge variant="outline">{selectedEvent.event_type}</Badge>
                <Badge variant={selectedEvent.status === 'confirmed' ? 'default' : 'secondary'} className="ml-2">
                  {selectedEvent.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(selectedEvent.event_date), 'PPP • h:mm a')}</span>
                </div>
                {selectedEvent.event_location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.event_location}</span>
                  </div>
                )}
              </div>
              {selectedEvent.event_description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedEvent.event_description}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                {selectedEvent.status !== 'confirmed' && (
                  <Button 
                    onClick={() => updateEventStatus(selectedEvent.id, 'confirmed')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm
                  </Button>
                )}
                {selectedEvent.status !== 'cancelled' && (
                  <Button 
                    variant="outline" 
                    onClick={() => updateEventStatus(selectedEvent.id, 'cancelled')}
                  >
                    Cancel Event
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectCalendarAdmin;
