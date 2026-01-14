import { configureStore } from '@reduxjs/toolkit';
import calendarReducer from './slices/calendarSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    calendar: calendarReducer,
    auth: authReducer,
  },
});

export default store;
