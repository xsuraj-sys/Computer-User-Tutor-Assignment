import { useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const PublicCalendar = () => {
  const navigate = useNavigate();
  const { events } = useSelector((state) => state.calendar);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  // Format events for react-big-calendar
  const formattedEvents = events.map(event => ({
    id: event._id,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    allDay: event.allDay,
    resource: event,
  }));

  // Handle event selection - redirect to login if not authenticated
  const handleSelectEvent = useCallback((event) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // TODO: Open edit modal for authenticated users
    console.log('Event selected:', event);
  }, [isAuthenticated, navigate]);

  // Handle slot selection - redirect to login if not authenticated
  const handleSelectSlot = useCallback(({ start, end }) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // TODO: Open create modal for authenticated users
    console.log('Slot selected:', { start, end });
  }, [isAuthenticated, navigate]);

  // Custom event component with login prompt overlay
  const EventComponent = ({ event }) => (
    <div className="rbc-event-content relative">
      <strong>{event.title}</strong>
      {event.resource.description && (
        <div className="text-xs opacity-75">{event.resource.description}</div>
      )}
      {!isAuthenticated && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded">
          <span className="text-white text-xs font-medium">Login to interact</span>
        </div>
      )}
    </div>
  );

  // Custom toolbar with login prompt
  const CustomToolbar = ({ label, onNavigate, onView }) => (
    <div className="rbc-toolbar flex flex-col sm:flex-row justify-between items-center p-4 bg-white border-b">
      <div className="rbc-btn-group mb-2 sm:mb-0">
        <button type="button" onClick={() => onNavigate('PREV')}>
          Back
        </button>
        <button type="button" onClick={() => onNavigate('TODAY')}>
          Today
        </button>
        <button type="button" onClick={() => onNavigate('NEXT')}>
          Next
        </button>
      </div>
      
      <span className="rbc-toolbar-label text-lg font-semibold mb-2 sm:mb-0">{label}</span>
      
      <div className="rbc-btn-group">
        <button type="button" onClick={() => onView('month')}>
          Month
        </button>
        <button type="button" onClick={() => onView('week')}>
          Week
        </button>
        <button type="button" onClick={() => onView('day')}>
          Day
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-white rounded-lg shadow-sm">
      {!isAuthenticated && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 text-sm">
                🔒 You're viewing the calendar in read-only mode
              </span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign in to create events
            </button>
          </div>
        </div>
      )}
      
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
        selectable={isAuthenticated}
        resizable={isAuthenticated}
        showMultiDayTimes
        step={15}
        timeslots={4}
        eventPropGetter={(event) => ({
          className: `rbc-event-custom ${event.resource.color ? '' : 'bg-blue-500'} ${!isAuthenticated ? 'cursor-not-allowed' : 'cursor-pointer'}`,
          style: {
            backgroundColor: event.resource.color || '#4285f4',
            borderColor: event.resource.color || '#4285f4',
            opacity: !isAuthenticated ? 0.8 : 1,
          },
        })}
        slotPropGetter={() => ({
          className: !isAuthenticated ? 'cursor-not-allowed' : 'cursor-pointer'
        })}
        components={{
          event: EventComponent,
          toolbar: CustomToolbar,
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

export default PublicCalendar;
