import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  closeEventModal, 
  updateNewEvent,
  deleteEventAsync
} from '../store/slices/calendarSlice';

const EventModal = ({ onCreateEvent, onCloseEventModal, onInputChange }) => {
  const dispatch = useDispatch();
  const { showEventModal, newEvent, events, loading } = useSelector(state => state.calendar);
  
  const isEditing = newEvent._id !== undefined;

  if (!showEventModal) return null;

  const handleSave = () => {
    onCreateEvent();
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

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Event' : 'Create New Event'}</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Event Title</label>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Add title"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add description"
              className="form-textarea"
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={newEvent.date.toISOString().split('T')[0]}
              onChange={(e) => handleInputChange('date', new Date(e.target.value))}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={newEvent.date.toTimeString().slice(0, 5)}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const newDate = new Date(newEvent.date);
                newDate.setHours(parseInt(hours), parseInt(minutes));
                handleInputChange('date', newDate);
              }}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={newEvent.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              className="form-input"
              min="15"
              step="15"
            />
          </div>
          <div className="form-group">
            <label>Color</label>
            <div className="color-options">
              {['#4285f4', '#34a853', '#fbbc04', '#ea4335', '#8e44ad', '#2c3e50'].map(color => (
                <button
                  key={color}
                  className={`color-option ${newEvent.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleInputChange('color', color)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {isEditing && (
            <button className="delete-btn" onClick={handleDelete}>
              Delete
            </button>
          )}
          <button className="cancel-btn" onClick={handleClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>
            {isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
