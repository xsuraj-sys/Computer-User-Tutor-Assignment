import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventAPI } from '../../services/api';
import { setUnauthenticated } from './authSlice';

// Async thunks for API calls
export const fetchEvents = createAsyncThunk(
  'calendar/fetchEvents',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState();
      const { currentDate, currentView } = state.calendar;
      
      // Calculate date range based on current view
      let start, end;
      const current = new Date(currentDate);
      
      switch (currentView) {
        case 'month':
          start = new Date(current.getFullYear(), current.getMonth(), 1);
          end = new Date(current.getFullYear(), current.getMonth() + 1, 0);
          break;
        case 'week':
          const weekStart = new Date(current);
          weekStart.setDate(current.getDate() - current.getDay());
          start = new Date(weekStart);
          
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          end = new Date(weekEnd);
          break;
        case 'day':
          start = new Date(current);
          end = new Date(current);
          break;
        default:
          start = new Date(current.getFullYear(), current.getMonth(), 1);
          end = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      }
      
      // Set time to beginning and end of day
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      return await eventAPI.getAllEvents(start, end);
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(setUnauthenticated());
      }
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createEventAsync = createAsyncThunk(
  'calendar/createEvent',
  async (eventData, { rejectWithValue, dispatch }) => {
    try {
      return await eventAPI.createEvent(eventData);
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(setUnauthenticated());
      }
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateEventAsync = createAsyncThunk(
  'calendar/updateEvent',
  async ({ id, updates }, { rejectWithValue, dispatch }) => {
    try {
      return await eventAPI.updateEvent(id, updates);
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(setUnauthenticated());
      }
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteEventAsync = createAsyncThunk(
  'calendar/deleteEvent',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await eventAPI.deleteEvent(id);
      return id;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(setUnauthenticated());
      }
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const getDefaultState = () => ({
  currentDate: new Date(),
  currentView: 'month',
  showEventModal: false,
  selectedDate: null,
  newEvent: {
    title: '',
    description: '',
    date: new Date(),
    duration: 60,
    color: '#4285f4'
  },
  events: [],
  loading: false,
  error: null
});

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: getDefaultState(),
  reducers: {
    // Navigation actions
    setCurrentDate: (state, action) => {
      state.currentDate = action.payload;
    },
    
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    
    navigateMonth: (state, action) => {
      const direction = action.payload;
      const newDate = new Date(state.currentDate);
      newDate.setMonth(state.currentDate.getMonth() + direction);
      state.currentDate = newDate;
    },
    
    navigateWeek: (state, action) => {
      const direction = action.payload;
      const newDate = new Date(state.currentDate);
      newDate.setDate(state.currentDate.getDate() + (direction * 7));
      state.currentDate = newDate;
    },
    
    navigateDay: (state, action) => {
      const direction = action.payload;
      const newDate = new Date(state.currentDate);
      newDate.setDate(state.currentDate.getDate() + direction);
      state.currentDate = newDate;
    },
    
    goToToday: (state) => {
      state.currentDate = new Date();
    },
    
    // Event modal actions
    openEventModal: (state, action) => {
      state.selectedDate = action.payload;
      // If action.payload has event data (for editing), use it
      // Otherwise create a new event with default values
      if (action.payload._id) {
        // Editing existing event
        state.newEvent = { ...action.payload };
      } else {
        // Creating new event
        state.newEvent = {
          title: '',
          description: '',
          start: action.payload.start || new Date(),
          end: action.payload.end || new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
          allDay: false,
          location: '',
          attendees: [],
          color: '#4285f4',
          ...action.payload
        };
      }
      state.showEventModal = true;
    },

    editEvent: (state, action) => {
      const eventId = action.payload;
      const event = state.events.find(e => e._id === eventId);
      if (event) {
        state.newEvent = { ...event };
        state.showEventModal = true;
      }
    },
    
    closeEventModal: (state) => {
      state.showEventModal = false;
      state.selectedDate = null;
      state.error = null;
    },
    
    updateNewEvent: (state, action) => {
      const { field, value } = action.payload;
      state.newEvent[field] = value;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Utility actions
    setNewEventDate: (state, action) => {
      state.newEvent.date = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.map(event => ({
          ...event,
          date: new Date(event.date)
        }));
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create event
      .addCase(createEventAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEventAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.events.push({
          ...action.payload,
          date: new Date(action.payload.date)
        });
        state.showEventModal = false;
        state.selectedDate = null;
      })
      .addCase(createEventAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update event
      .addCase(updateEventAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEventAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.events.findIndex(event => event._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = {
            ...action.payload,
            date: new Date(action.payload.date)
          };
        }
        state.showEventModal = false;
      })
      .addCase(updateEventAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete event
      .addCase(deleteEventAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEventAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(event => event._id !== action.payload);
      })
      .addCase(deleteEventAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setCurrentDate,
  setCurrentView,
  navigateMonth,
  navigateWeek,
  navigateDay,
  goToToday,
  openEventModal,
  editEvent,
  closeEventModal,
  updateNewEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  clearError,
  setNewEventDate
} = calendarSlice.actions;

export default calendarSlice.reducer;
