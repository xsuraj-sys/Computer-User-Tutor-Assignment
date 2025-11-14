import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  closeEventModal, 
  updateNewEvent,
  deleteEventAsync
} from '../store/slices/calendarSlice';

const EnhancedEventModal = ({ onCreateEvent, onCloseEventModal, onInputChange }) => {
  const dispatch = useDispatch();
  const { showEventModal, newEvent, events, loading } = useSelector(state => state.calendar);
  
  const isEditing = newEvent._id !== undefined;
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [recurrenceOptions, setRecurrenceOptions] = useState({
    frequency: 'WEEKLY',
    interval: 1,
    count: null,
    until: null,
    byweekday: []
  });

  if (!showEventModal) return null;

  const handleSave = () => {
    const eventData = { ...newEvent };
    
    // Ensure start and end are properly formatted
    if (eventData.start) {
      eventData.start = new Date(eventData.start).toISOString();
    }
    if (eventData.end) {
      eventData.end = new Date(eventData.end).toISOString();
    }
    
    // Handle recurrence options
    if (showRecurrence && recurrenceOptions.frequency) {
      // Convert recurrence options to proper format for backend
      const recurrenceData = { ...recurrenceOptions };
      
      // Convert byweekday array to proper format if needed
      if (recurrenceData.byweekday && recurrenceData.byweekday.length > 0) {
        recurrenceData.byweekday = recurrenceData.byweekday.map(day => parseInt(day));
      }
      
      // Convert until date to ISO string if provided
      if (recurrenceData.until) {
        recurrenceData.until = new Date(recurrenceData.until).toISOString();
      }
      
      eventData.recurrenceOptions = recurrenceData;
    }
    
    onCreateEvent(eventData);
  };

  const handleDelete = () => {
    if (isEditing && window.confirm('Are you sure you want to delete this event?')) {
      dispatch(deleteEventAsync(newEvent._id));
    }
  };

  const handleInputChange = (field, value) => {
    onInputChange(field, value);
  };

  const handleClose = () => {
    onCloseEventModal();
  };

  const handleRecurrenceChange = (field, value) => {
    setRecurrenceOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getWeekdayOptions = () => [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const formatTime = (date) => {
    return date.toTimeString().slice(0, 5);
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Event' : 'Create Event'}
          </h3>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              value={newEvent.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Add a title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newEvent.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add a description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={newEvent.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Add a location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Start Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={newEvent.start ? formatDate(new Date(newEvent.start)) : ''}
                onChange={(e) => {
                  const newStart = new Date(newEvent.start || new Date());
                  newStart.setFullYear(
                    parseInt(e.target.value.split('-')[0]),
                    parseInt(e.target.value.split('-')[1]) - 1,
                    parseInt(e.target.value.split('-')[2])
                  );
                  handleInputChange('start', newStart);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={newEvent.start ? formatTime(new Date(newEvent.start)) : ''}
                onChange={(e) => {
                  const newStart = new Date(newEvent.start || new Date());
                  const [hours, minutes] = e.target.value.split(':');
                  newStart.setHours(parseInt(hours), parseInt(minutes));
                  handleInputChange('start', newStart);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={newEvent.end ? formatDate(new Date(newEvent.end)) : ''}
                onChange={(e) => {
                  const newEnd = new Date(newEvent.end || new Date());
                  newEnd.setFullYear(
                    parseInt(e.target.value.split('-')[0]),
                    parseInt(e.target.value.split('-')[1]) - 1,
                    parseInt(e.target.value.split('-')[2])
                  );
                  handleInputChange('end', newEnd);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={newEvent.end ? formatTime(new Date(newEvent.end)) : ''}
                onChange={(e) => {
                  const newEnd = new Date(newEvent.end || new Date());
                  const [hours, minutes] = e.target.value.split(':');
                  newEnd.setHours(parseInt(hours), parseInt(minutes));
                  handleInputChange('end', newEnd);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* All Day */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allDay"
              checked={newEvent.allDay || false}
              onChange={(e) => handleInputChange('allDay', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allDay" className="ml-2 block text-sm text-gray-700">
              All day event
            </label>
          </div>

          {/* Recurrence Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurrence"
              checked={showRecurrence}
              onChange={(e) => setShowRecurrence(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="recurrence" className="ml-2 block text-sm text-gray-700">
              Repeat event
            </label>
          </div>

          {/* Recurrence Options */}
          {showRecurrence && (
            <div className="bg-gray-50 p-4 rounded-md space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repeat every
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={recurrenceOptions.interval}
                    onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  <select
                    value={recurrenceOptions.frequency}
                    onChange={(e) => handleRecurrenceChange('frequency', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DAILY">day(s)</option>
                    <option value="WEEKLY">week(s)</option>
                    <option value="MONTHLY">month(s)</option>
                    <option value="YEARLY">year(s)</option>
                  </select>
                </div>
              </div>

              {recurrenceOptions.frequency === 'WEEKLY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repeat on
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getWeekdayOptions().map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          const currentDays = [...recurrenceOptions.byweekday];
                          const index = currentDays.indexOf(day.value);
                          if (index > -1) {
                            currentDays.splice(index, 1);
                          } else {
                            currentDays.push(day.value);
                          }
                          handleRecurrenceChange('byweekday', currentDays);
                        }}
                        className={`px-3 py-1 text-sm rounded-md border ${
                          recurrenceOptions.byweekday.includes(day.value)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {day.label.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="never"
                      name="endOption"
                      checked={!recurrenceOptions.count && !recurrenceOptions.until}
                      onChange={() => handleRecurrenceChange('count', null)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="never" className="ml-2 text-sm text-gray-700">
                      Never
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="after"
                      name="endOption"
                      checked={!!recurrenceOptions.count}
                      onChange={() => handleRecurrenceChange('count', 10)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="after" className="ml-2 text-sm text-gray-700">
                      After
                    </label>
                    <input
                      type="number"
                      value={recurrenceOptions.count || ''}
                      onChange={(e) => handleRecurrenceChange('count', parseInt(e.target.value))}
                      className="ml-2 w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      placeholder="10"
                    />
                    <span className="ml-1 text-sm text-gray-700">occurrences</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="onDate"
                      name="endOption"
                      checked={!!recurrenceOptions.until}
                      onChange={() => handleRecurrenceChange('until', new Date())}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="onDate" className="ml-2 text-sm text-gray-700">
                      On
                    </label>
                    <input
                      type="date"
                      value={recurrenceOptions.until ? formatDate(new Date(recurrenceOptions.until)) : ''}
                      onChange={(e) => handleRecurrenceChange('until', new Date(e.target.value))}
                      className="ml-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {[
                '#4285f4', '#34a853', '#fbbc04', '#ea4335', 
                '#8e44ad', '#2c3e50', '#16a085', '#e74c3c'
              ].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange('color', color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    newEvent.color === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t bg-gray-50 rounded-b-lg">
          {isEditing && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          )}
          <div className="flex space-x-3 ml-auto">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEventModal;
