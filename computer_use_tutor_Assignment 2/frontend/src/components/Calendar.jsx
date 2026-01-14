import { useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { eventAPI } from '../services/api';
import { 
  openEventModal, 
  updateNewEvent,
  fetchEvents,
  updateEventAsync
} from '../store/slices/calendarSlice';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarComponent = () => {
  const dispatch = useDispatch();
  const { events, currentDate } = useSelector((state) => state.calendar);
  const { user } = useSelector((state) => state.auth);
  
  const [view, setView] = useState('month');
  const [date, setDate] = useState(currentDate);

  // Format events for react-big-calendar
  const formattedEvents = events.map(event => ({
    id: event._id,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    allDay: event.allDay,
    resource: event,
  }));

  // Handle event selection
  const handleSelectEvent = useCallback((event) => {
    dispatch(openEventModal({
      _id: event.id,
      title: event.title,
      description: event.resource.description,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      location: event.resource.location,
      attendees: event.resource.attendees || [],
      recurringRule: event.resource.recurringRule,
      recurrenceId: event.resource.recurrenceId
    }));
  }, [dispatch]);

  // Handle slot selection (creating new event)
  const handleSelectSlot = useCallback(({ start, end }) => {
    dispatch(openEventModal({
      start: start,
      end: end,
      allDay: false,
      title: '',
      description: '',
      location: '',
      attendees: []
    }));
  }, [dispatch]);

  // Handle event drop (drag & drop)
  const handleEventDrop = useCallback(async ({ event, start, end }) => {
    try {
      await dispatch(updateEventAsync({
        id: event.id,
        updates: {
          start: start.toISOString(),
          end: end.toISOString(),
        }
      })).unwrap();
      dispatch(fetchEvents()); // Refresh events
    } catch (error) {
      console.error('Failed to update event:', error);
      // Revert by refreshing events
      dispatch(fetchEvents());
    }
  }, [dispatch]);

  // Handle event resize
  const handleEventResize = useCallback(async ({ event, start, end }) => {
    try {
      await dispatch(updateEventAsync({
        id: event.id,
        updates: {
          start: start.toISOString(),
          end: end.toISOString(),
        }
      })).unwrap();
      dispatch(fetchEvents()); // Refresh events
    } catch (error) {
      console.error('Failed to resize event:', error);
      // Revert by refreshing events
      dispatch(fetchEvents());
    }
  }, [dispatch]);

  // Custom event component
  const EventComponent = ({ event }) => (
    <div className="rbc-event-content">
      <strong>{event.title}</strong>
      {event.resource.description && (
        <div className="text-xs opacity-75">{event.resource.description}</div>
      )}
    </div>
  );

  return (
    <div className="h-full bg-white rounded-lg shadow-sm">
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 200px)' }}
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        selectable
        resizable
        showMultiDayTimes
        step={15}
        timeslots={4}
        eventPropGetter={(event) => ({
          className: `rbc-event-custom ${event.resource.color ? '' : 'bg-blue-500'}`,
          style: {
            backgroundColor: event.resource.color || '#4285f4',
            borderColor: event.resource.color || '#4285f4',
          },
        })}
        components={{
          event: EventComponent,
        }}
        messages={{
          next: "Next",
          previous: "Previous",
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
          agenda: "Agenda",
          date: "Date",
          time: "Time",
          event: "Event",
          noEventsInRange: "No events in this range",
          showMore: (total) => `+${total} more`,
        }}
      />
    </div>
  );
};

export default CalendarComponent;
