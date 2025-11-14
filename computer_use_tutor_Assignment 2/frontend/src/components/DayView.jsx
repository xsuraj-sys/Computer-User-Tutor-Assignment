import React from 'react';
import { useDispatch } from 'react-redux';
import { editEvent } from '../store/slices/calendarSlice';

const DayView = ({ 
  currentDate, 
  events, 
  onOpenEventModal,
  getEventsForDate 
}) => {
  const dispatch = useDispatch();

  const handleEventClick = (eventId, e) => {
    e.stopPropagation();
    dispatch(editEvent(eventId));
  };
  // Generate time slots for day view
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 23) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  const dayEvents = getEventsForDate(currentDate);
  const isToday = new Date().toDateString() === currentDate.toDateString();

  return (
    <div className="day-view">
      <div className="day-header">
        <div className="day-info">
          <div className="day-name">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <div className={`day-date ${isToday ? 'today' : ''}`}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <button 
          className="add-event-btn"
          onClick={() => onOpenEventModal(currentDate)}
        >
          + Add event
        </button>
      </div>
      <div className="day-timeline">
        <div className="time-column">
          {timeSlots.map(time => (
            <div key={time} className="time-slot">
              {time}
            </div>
          ))}
        </div>
        <div className="day-column">
          {timeSlots.map(time => (
            <div 
              key={time} 
              className="time-slot-grid"
              onClick={() => {
                const [hours, minutes] = time.split(':');
                const date = new Date(currentDate);
                date.setHours(parseInt(hours), parseInt(minutes));
                onOpenEventModal(date);
              }}
            ></div>
          ))}
          {dayEvents.map(event => {
            const eventDate = new Date(event.date);
            const startHour = eventDate.getHours();
            const startMinute = eventDate.getMinutes();
            const startPosition = (startHour * 2) + (startMinute >= 30 ? 1 : 0);
            const durationSlots = Math.ceil(event.duration / 30);
            
            return (
              <div
                key={event.id}
                className="day-event"
                style={{
                  backgroundColor: event.color,
                  top: `${startPosition * 40}px`,
                  height: `${durationSlots * 40}px`
                }}
                onClick={(e) => handleEventClick(event.id, e)}
              >
                <div className="day-event-time">
                  {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="day-event-title">{event.title}</div>
                {event.description && (
                  <div className="day-event-description">{event.description}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayView;
