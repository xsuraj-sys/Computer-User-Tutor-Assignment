const { RRule, RRuleSet, rrulestr } = require('rrule');

/**
 * Generate recurrence instances for a given event within a date range
 * @param {Object} event - Event object with recurringRule
 * @param {Date} rangeStart - Start of the range
 * @param {Date} rangeEnd - End of the range
 * @returns {Array} Array of event instances
 */
const generateRecurrenceInstances = (event, rangeStart, rangeEnd) => {
  if (!event.recurringRule) {
    return [];
  }

  try {
    const rule = rrulestr(event.recurringRule);
    const instances = rule.between(rangeStart, rangeEnd, true);
    
    return instances.map(instanceDate => ({
      ...event.toObject(),
      _id: `${event._id}_${instanceDate.getTime()}`,
      start: new Date(instanceDate),
      end: new Date(instanceDate.getTime() + (event.end - event.start)),
      recurrenceId: event.start,
      isRecurringInstance: true,
      originalEventId: event._id
    }));
  } catch (error) {
    console.error('Error generating recurrence instances:', error);
    return [];
  }
};

/**
 * Check for event conflicts for the same owner
 * @param {Object} eventData - New event data
 * @param {String} ownerId - User ID
 * @param {String} excludeEventId - Event ID to exclude (for updates)
 * @returns {Array} Array of conflicting event IDs
 */
const checkEventConflicts = async (Event, eventData, ownerId, excludeEventId = null) => {
  const { start, end, allDay } = eventData;
  
  if (allDay) {
    // For all-day events, check for any overlap on the same day
    const nextDay = new Date(start);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const query = {
      ownerId,
      allDay: true,
      start: { $lt: nextDay },
      end: { $gt: start }
    };
    
    if (excludeEventId) {
      query._id = { $ne: excludeEventId };
    }
    
    const conflicts = await Event.find(query);
    return conflicts.map(conflict => conflict._id.toString());
  } else {
    // For timed events, check for time overlap
    const query = {
      ownerId,
      allDay: false,
      $or: [
        { start: { $lt: end }, end: { $gt: start } }, // Overlapping
        { start: { $gte: start, $lt: end } }, // Starts during
        { end: { $gt: start, $lte: end } } // Ends during
      ]
    };
    
    if (excludeEventId) {
      query._id = { $ne: excludeEventId };
    }
    
    const conflicts = await Event.find(query);
    return conflicts.map(conflict => conflict._id.toString());
  }
};

/**
 * Convert recurrence options to RRule string
 * @param {Object} options - Recurrence options
 * @returns {String} RRule string
 */
const generateRRuleString = (options) => {
  const { frequency, interval, count, until, byweekday, bymonthday } = options;
  
  const ruleOptions = {
    freq: frequency,
    interval: interval || 1
  };
  
  if (count) {
    ruleOptions.count = count;
  }
  
  if (until) {
    ruleOptions.until = new Date(until);
  }
  
  if (byweekday && byweekday.length > 0) {
    ruleOptions.byweekday = byweekday;
  }
  
  if (bymonthday && bymonthday.length > 0) {
    ruleOptions.bymonthday = bymonthday;
  }
  
  const rule = new RRule(ruleOptions);
  return rule.toString();
};

module.exports = {
  generateRecurrenceInstances,
  checkEventConflicts,
  generateRRuleString
};
