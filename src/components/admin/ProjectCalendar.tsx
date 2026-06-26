import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Clock, MapPin, User, Plus, Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectCalendarProps {
  projectId: string;
  clientId: string;
}

interface ProjectEvent {
  id: string;
  event_title: string;
  event_description: string | null;
  event_type: 'meeting' | 'testing' | 'deadline' | 'review' | 'milestone';
  event_date: string;
  event_end_date: string | null;
  created_by_type: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  event_location?: string | null;
  attendees?: string[] | null;
}

const eventTypeColors = {
  meeting: 'bg-blue-500',
  testing: 'bg-purple-500',
  deadline: 'bg-red-500',
  review: 'bg-yellow-500',
  milestone: 'bg-green-500',
};

const ProjectCalendar = ({ projectId, clientId }: ProjectCalendarProps) => {
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ProjectEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    event_title: '',
    event_description: '',
    event_type: 'meeting' as ProjectEvent['event_type'],
    event_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    event_location: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
    
    // Subscribe to realtime events
    const channel = supabase
      .channel('project_events_changes')
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
      const { data, error } = await supabase
        .rpc('get_project_events', { p_project_id: projectId });

      if (error) throw error;
      setEvents((data || []) as ProjectEvent[]);
    } catch (error: any) {
      console.error('Error loading events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calendar events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    try {
      const { error } = await supabase
        .rpc('create_project_event', {
          p_project_id: projectId,
          p_event_title: newEvent.event_title,
          p_event_description: newEvent.event_description || null,
          p_event_type: newEvent.event_type,
          p_event_date: new Date(newEvent.event_date).toISOString(),
          p_event_location: newEvent.event_location || null,
          p_created_by: clientId,
          p_created_by_type: 'client',
          p_status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Event created successfully',
      });

      setShowCreateDialog(false);
      setNewEvent({
        event_title: '',
        event_description: '',
        event_type: 'meeting',
        event_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        event_location: '',
      });
      loadEvents();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
    }
  };

  const updateEventStatus = async (eventId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .rpc('update_project_event_status', {
          p_event_id: eventId,
          p_status: status,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Event ${status}`,
      });

      setSelectedEvent(null);
      loadEvents();
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive',
      });
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.event_date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getDatesWithEvents = () => {
    return events.map(event => new Date(event.event_date));
  };

  const getConfirmedDates = () => {
    return events
      .filter(event => event.status === 'confirmed')
      .map(event => new Date(event.event_date));
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Project Calendar</h2>
          <p className="text-muted-foreground">Schedule and manage project events</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              Click on dates to view events. Green dates have confirmed events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasEvent: getDatesWithEvents(),
                confirmed: getConfirmedDates(),
              }}
              modifiersClassNames={{
                hasEvent: 'bg-primary/10 font-bold',
                confirmed: 'bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-100 font-bold',
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length > 0
                ? `${selectedDateEvents.length} event${selectedDateEvents.length > 1 ? 's' : ''}`
                : 'No events scheduled'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${eventTypeColors[event.event_type]}`} />
                            <p className="font-medium text-sm">{event.event_title}</p>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(event.event_date), 'h:mm a')}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="text-xs">
                            {event.event_type}
                          </Badge>
                          {event.status === 'confirmed' && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Confirmed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No events on this date</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>All scheduled events for this project</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading events...</p>
          ) : events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full mt-1 ${eventTypeColors[event.event_type]}`} />
                    <div className="flex-1">
                      <p className="font-medium">{event.event_title}</p>
                      {event.event_description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.event_description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {format(new Date(event.event_date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(event.event_date), 'h:mm a')}
                        </span>
                        {event.event_location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.event_location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant="outline">{event.event_type}</Badge>
                    {event.status === 'confirmed' && (
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Confirmed
                      </Badge>
                    )}
                    {event.status === 'pending' && (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No events scheduled yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>Schedule a new event for this project</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={newEvent.event_title}
                onChange={(e) => setNewEvent({ ...newEvent, event_title: e.target.value })}
                placeholder="Project kickoff meeting"
              />
            </div>
            <div>
              <Label htmlFor="type">Event Type</Label>
              <Select
                value={newEvent.event_type}
                onValueChange={(value: ProjectEvent['event_type']) => 
                  setNewEvent({ ...newEvent, event_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date & Time</Label>
              <Input
                id="date"
                type="datetime-local"
                value={newEvent.event_date}
                onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={newEvent.event_location}
                onChange={(e) => setNewEvent({ ...newEvent, event_location: e.target.value })}
                placeholder="Zoom, Office, etc."
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={newEvent.event_description}
                onChange={(e) => setNewEvent({ ...newEvent, event_description: e.target.value })}
                placeholder="Additional details about the event"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createEvent}
              disabled={!newEvent.event_title || !newEvent.event_date}
            >
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.event_title}</DialogTitle>
            <DialogDescription>Event details and actions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Badge variant="outline">{selectedEvent?.event_type}</Badge>
              {selectedEvent?.status === 'confirmed' && (
                <Badge className="ml-2 bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Confirmed
                </Badge>
              )}
              {selectedEvent?.status === 'pending' && (
                <Badge className="ml-2" variant="secondary">Pending</Badge>
              )}
            </div>
            {selectedEvent?.event_description && (
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedEvent.event_description}</p>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEvent && format(new Date(selectedEvent.event_date), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEvent && format(new Date(selectedEvent.event_date), 'h:mm a')}</span>
              </div>
              {selectedEvent?.event_location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.event_location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Created by {selectedEvent?.created_by_type}</span>
              </div>
            </div>
            {selectedEvent?.status === 'pending' && (
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => selectedEvent && updateEventStatus(selectedEvent.id, 'confirmed')}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Event
                </Button>
                <Button 
                  onClick={() => selectedEvent && updateEventStatus(selectedEvent.id, 'cancelled')}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Event
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectCalendar;