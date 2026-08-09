require('dotenv').config();

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

module.exports = {
  OFFICE_COORDS: {
    latitude: parseFloat(process.env.OFFICE_LATITUDE || '6.6152'),
    longitude: parseFloat(process.env.OFFICE_LONGITUDE || '3.5073'),
  },
  OFFICE_RADIUS_METERS: parseFloat(process.env.OFFICE_RADIUS_METERS || '200'),

  WORK_START_MIN: toMinutes(process.env.WORK_START_TIME || '08:00'),
  LATE_CUTOFF_MIN: toMinutes(process.env.LATE_CUTOFF_TIME || '09:00'),
  WORK_END_MIN: toMinutes(process.env.WORK_END_TIME || '16:00'),
  FULL_WORK_HOURS: parseFloat(process.env.FULL_WORK_HOURS || '8'),

  WORK_START_TIME: process.env.WORK_START_TIME || '08:00',
  LATE_CUTOFF_TIME: process.env.LATE_CUTOFF_TIME || '09:00',
  WORK_END_TIME: process.env.WORK_END_TIME || '16:00',
};
