import React from 'react';
import { useDispatch } from 'react-redux';
import { editEvent } from '../store/slices/calendarSlice';

const MonthView = ({ 
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
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    
    const grid = [];
    let dayCounter = 1;
    
    // Generate 6 rows (weeks)
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      
      // Generate 7 days per week
      for (let day = 0; day < 7; day++) {
        if ((week === 0 && day < firstDay) || dayCounter > daysInMonth) {
          // Empty cell (before first day or after last day)
          weekDays.push({ day: null, isCurrentMonth: false });
        } else {
          // Current month day
          const date = new Date(year, month, dayCounter);
          const isToday = new Date().toDateString() === date.toDateString();
          weekDays.push({ 
            day: dayCounter, 
            date,
            isCurrentMonth: true,
            isToday 
          });
          dayCounter++;
        }
      }
      grid.push(weekDays);
    }
    
    return grid;
  };

  const monthGrid = generateMonthGrid();

  return (
    <div className="month-view">
      <div className="calendar-grid">
        {/* Week day headers */}
        <div className="week-days">
          {weekDays.map(day => (
            <div key={day} className="week-day">{day}</div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="month-grid">
          {monthGrid.map((week, weekIndex) => (
            <div key={weekIndex} className="week-row">
              {week.map((dayData, dayIndex) => (
                <div 
                  key={`${weekIndex}-${dayIndex}`}
                  className={`day-cell ${!dayData.isCurrentMonth ? 'other-month' : ''} ${dayData.isToday ? 'today' : ''}`}
                  onClick={() => onOpenEventModal(dayData.date)}
                >
                  {dayData.day && (
                    <>
                      <div className="day-number">{dayData.day}</div>
                      <div className="events-container">
                        {getEventsForDate(dayData.date).map(event => (
                          <div 
                            key={event.id}
                            className="event-item"
                            style={{ backgroundColor: event.color }}
                            onClick={(e) => handleEventClick(event.id, e)}
                          >
                            <span className="event-time">
                              {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="event-title">{event.title}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthView;
