import React from 'react';
import { useDispatch } from 'react-redux';
import { editEvent } from '../store/slices/calendarSlice';

const WeekView = ({ 
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
  // Generate week data
  const generateWeekData = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekDays.push({
        date,
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        dayNumber: date.getDate(),
        isToday: new Date().toDateString() === date.toDateString()
      });
    }
    return weekDays;
  };

  // Generate time slots for week view
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 23) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  const weekData = generateWeekData();

  return (
    <div className="week-view">
      <div className="week-header">
        <div className="time-column-header"></div>
        {weekData.map(day => (
          <div 
            key={day.date.toDateString()} 
            className={`week-day-header ${day.isToday ? 'today' : ''}`}
            onClick={() => onOpenEventModal(day.date)}
          >
            <div className="day-name">{day.dayName}</div>
            <div className="day-number">{day.dayNumber}</div>
          </div>
        ))}
      </div>
      <div className="week-timeline">
        <div className="time-column">
          {timeSlots.map(time => (
            <div key={time} className="time-slot">
              {time}
            </div>
          ))}
        </div>
        <div className="days-columns">
          {weekData.map(day => (
            <div 
              key={day.date.toDateString()} 
              className="day-column"
              onClick={() => onOpenEventModal(day.date)}
            >
              {timeSlots.map(time => (
                <div key={time} className="time-slot-grid"></div>
              ))}
              {getEventsForDate(day.date).map(event => {
                const eventDate = new Date(event.date);
                const startHour = eventDate.getHours();
                const startMinute = eventDate.getMinutes();
                const startPosition = (startHour * 2) + (startMinute >= 30 ? 1 : 0);
                const durationSlots = Math.ceil(event.duration / 30);
                
                return (
                  <div
                    key={event.id}
                    className="week-event"
                    style={{
                      backgroundColor: event.color,
                      top: `${startPosition * 40}px`,
                      height: `${durationSlots * 40}px`
                    }}
                    onClick={(e) => handleEventClick(event.id, e)}
                  >
                    <div className="week-event-time">
                      {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="week-event-title">{event.title}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
