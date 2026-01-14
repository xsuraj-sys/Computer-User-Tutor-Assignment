import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import CalendarHeader from './components/CalendarHeader';
import CalendarComponent from './components/Calendar';
import PublicCalendar from './components/PublicCalendar';
import EnhancedEventModal from './components/EnhancedEventModal';
import { 
  navigateMonth, 
  navigateWeek, 
  navigateDay, 
  goToToday, 
  setCurrentView,
  openEventModal,
  closeEventModal,
  updateNewEvent,
  clearError,
  fetchEvents,
  createEventAsync,
  updateEventAsync,
  deleteEventAsync
} from './store/slices/calendarSlice';
import { getCurrentUser, logout } from './store/slices/authSlice';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public route component (redirect to my-calendar if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/my-calendar" />;
};

// Public calendar route - accessible to all users
const PublicCalendarRoute = ({ children }) => {
  return children;
};

function CalendarApp() {
  const dispatch = useDispatch();
  const calendarState = useSelector(state => state.calendar);
  const authState = useSelector(state => state.auth);
  
  const {
    currentDate,
    currentView,
    showEventModal,
    newEvent,
    events,
    loading,
    error
  } = calendarState;

  // Fetch current user on app load
  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  // Fetch events when authenticated
  useEffect(() => {
    if (authState.isAuthenticated) {
      dispatch(fetchEvents());
    }
  }, [dispatch, authState.isAuthenticated]);

  // Navigation handlers
  const handleNavigateMonth = (direction) => {
    dispatch(navigateMonth(direction));
  };

  const handleNavigateWeek = (direction) => {
    dispatch(navigateWeek(direction));
  };

  const handleNavigateDay = (direction) => {
    dispatch(navigateDay(direction));
  };

  const handleGoToToday = () => {
    dispatch(goToToday());
  };

  const handleViewChange = (view) => {
    dispatch(setCurrentView(view));
  };

  // Event handlers
  const handleOpenEventModal = (date) => {
    dispatch(openEventModal(date));
  };

  const handleCloseEventModal = () => {
    dispatch(closeEventModal());
  };

  const handleInputChange = (field, value) => {
    dispatch(updateNewEvent({ field, value }));
  };

  const handleCreateEvent = () => {
    if (newEvent._id) {
      // Update existing event
      const { _id, ...updates } = newEvent;
      dispatch(updateEventAsync({ id: _id, updates }));
    } else {
      // Create new event
      dispatch(createEventAsync(newEvent));
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  // Logout handler
  const handleLogout = () => {
    dispatch(logout());
  };

  // Utility function to get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="calendar-app h-screen flex flex-col">
      <CalendarHeader
        currentDate={currentDate}
        currentView={currentView}
        onNavigateMonth={handleNavigateMonth}
        onNavigateWeek={handleNavigateWeek}
        onNavigateDay={handleNavigateDay}
        onGoToToday={handleGoToToday}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
      />

      <main className="calendar-main flex-1 p-4 bg-gray-50">
        <CalendarComponent />
      </main>

      <EnhancedEventModal
        onCloseEventModal={handleCloseEventModal}
        onCreateEvent={handleCreateEvent}
        onInputChange={handleInputChange}
      />
    </div>
  );
}

// Public calendar app component
function PublicCalendarApp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector(state => state.auth);

  // Fetch current user on app load
  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return (
    <div className="calendar-app h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            </div>
            <div className="flex items-center space-x-4">
              {!authState.isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/my-calendar')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  My Calendar
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="calendar-main flex-1 p-4 bg-gray-50">
        <PublicCalendar />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <PublicCalendarRoute>
                <PublicCalendarApp />
              </PublicCalendarRoute>
            } 
          />
          <Route 
            path="/my-calendar" 
            element={
              <ProtectedRoute>
                <CalendarApp />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
