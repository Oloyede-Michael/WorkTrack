const {
  WORK_START_MIN,
  LATE_CUTOFF_MIN,
  WORK_END_MIN,
} = require('../config/constants');

/**
 * Convert a JS Date to "minutes since midnight" in local server time.
 */
function minutesSinceMidnight(date) {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Classify a check-in time against the 8:00 / 9:00 government work-hour windows.
 *   <= 8:00        -> on_time
 *   8:01 - 9:00     -> late
 *   > 9:00          -> half_day
 */
function classifyCheckIn(checkInDate) {
  const mins = minutesSinceMidnight(checkInDate);
  if (mins <= WORK_START_MIN) return 'on_time';
  if (mins <= LATE_CUTOFF_MIN) return 'late';
  return 'half_day';
}

/**
 * Classify a check-out time against the 4:00 PM standard exit window.
 *   < 16:00  -> early_exit
 *   >= 16:00 -> standard_exit
 */
function classifyCheckOut(checkOutDate) {
  const mins = minutesSinceMidnight(checkOutDate);
  return mins < WORK_END_MIN ? 'early_exit' : 'standard_exit';
}

/**
 * Daily productivity score derived from check-in/out status.
 *   productive      : on_time check-in AND standard_exit check-out
 *   partial         : late/half_day check-in OR early_exit check-out (but has both stamps)
 *   non_productive  : has a check-in but never checked out (or vice versa)
 *   absent          : no attendance record at all (handled by caller)
 */
function calculateProductivity({ checkInStatus, checkOutStatus, hasCheckIn, hasCheckOut }) {
  if (!hasCheckIn && !hasCheckOut) return 'absent';
  if (!hasCheckIn || !hasCheckOut) return 'non_productive';

  if (checkInStatus === 'on_time' && checkOutStatus === 'standard_exit') {
    return 'productive';
  }
  if (checkInStatus === 'half_day') {
    return 'partial';
  }
  return 'partial';
}

/**
 * Hours worked between check-in and check-out, rounded to 2dp.
 */
function calculateHoursWorked(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) return 0;
  const ms = new Date(checkOutDate) - new Date(checkInDate);
  if (ms <= 0) return 0;
  return Math.round((ms / (1000 * 60 * 60)) * 100) / 100;
}

module.exports = {
  classifyCheckIn,
  classifyCheckOut,
  calculateProductivity,
  calculateHoursWorked,
  minutesSinceMidnight,
};
