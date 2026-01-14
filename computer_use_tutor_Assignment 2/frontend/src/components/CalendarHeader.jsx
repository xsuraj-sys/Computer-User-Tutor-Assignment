import React from 'react';

const CalendarHeader = ({ 
  currentDate, 
  currentView, 
  onNavigateMonth, 
  onNavigateWeek, 
  onNavigateDay, 
  onGoToToday, 
  onViewChange,
  onLogout 
}) => {
  const getMonthYearString = () => {
    return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <header className="calendar-header">
      <div className="flex justify-between items-center">
        <h1>Calendar</h1>
        <button 
          onClick={onLogout}
          className="logout-btn bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default CalendarHeader;
