const pool = require('../config/db');
const { WORK_END_MIN } = require('../config/constants');
const {
  classifyCheckIn,
  classifyCheckOut,
  calculateProductivity,
  calculateHoursWorked,
} = require('../utils/attendanceLogic');

function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

// GET /api/admin/dashboard  - headline stats for today
async function getDashboardStats(req, res, next) {
  try {
    const workDate = req.query.date || todayDateString();

    const totalStaffRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM staff WHERE is_active = TRUE`
    );
    const totalStaff = totalStaffRes.rows[0].total;

    const statsRes = await pool.query(
      `SELECT
          COUNT(*) FILTER (WHERE check_in_time IS NOT NULL)::int AS present,
          COUNT(*) FILTER (WHERE check_in_status = 'late')::int AS late,
          COUNT(*) FILTER (WHERE check_in_status = 'half_day')::int AS half_day,
          COUNT(*) FILTER (WHERE productivity_status = 'productive')::int AS productive_today,
          COUNT(*) FILTER (WHERE check_out_time IS NOT NULL)::int AS checked_out
        FROM attendance_records WHERE work_date = $1`,
      [workDate]
    );

    const stats = statsRes.rows[0];
    const absent = totalStaff - stats.present;

    const deptBreakdown = await pool.query(
      `SELECT d.name AS department, COUNT(s.id)::int AS staff_count,
              COUNT(a.id) FILTER (WHERE a.check_in_time IS NOT NULL)::int AS present_count,
              COUNT(a.id) FILTER (WHERE a.productivity_status = 'productive')::int AS productive_count
         FROM departments d
         LEFT JOIN staff s ON s.department_id = d.id AND s.is_active = TRUE
         LEFT JOIN attendance_records a ON a.staff_id = s.id AND a.work_date = $1
        GROUP BY d.name ORDER BY d.name`,
      [workDate]
    );

    // 7-day productivity trend
    const trend = await pool.query(
      `SELECT work_date,
              COUNT(*) FILTER (WHERE productivity_status = 'productive')::int AS productive,
              COUNT(*) FILTER (WHERE productivity_status = 'partial')::int AS partial,
              COUNT(*) FILTER (WHERE productivity_status = 'non_productive')::int AS non_productive
         FROM attendance_records
        WHERE work_date >= ($1::date - INTERVAL '6 days') AND work_date <= $1::date
        GROUP BY work_date ORDER BY work_date ASC`,
      [workDate]
    );

    res.json({
      date: workDate,
      totalStaff,
      present: stats.present,
      absent: absent < 0 ? 0 : absent,
      late: stats.late,
      halfDay: stats.half_day,
      productiveToday: stats.productive_today,
      checkedOut: stats.checked_out,
      departmentBreakdown: deptBreakdown.rows,
      trend: trend.rows,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/attendance-board?filter=present|late|productive|absent&date=
async function getAttendanceBoard(req, res, next) {
  try {
    const workDate = req.query.date || todayDateString();
    const { filter = 'all', search = '' } = req.query;

    const conditions = ['s.is_active = TRUE'];
    const params = [workDate];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      conditions.push(`(LOWER(s.full_name) LIKE $${params.length} OR LOWER(s.staff_id_number) LIKE $${params.length})`);
    }

    let havingFilter = '';
    if (filter === 'present') havingFilter = 'a.check_in_time IS NOT NULL';
    else if (filter === 'late') havingFilter = `a.check_in_status IN ('late','half_day')`;
    else if (filter === 'productive') havingFilter = `a.productivity_status = 'productive'`;
    else if (filter === 'absent') havingFilter = 'a.check_in_time IS NULL';

    if (havingFilter) conditions.push(havingFilter);

    const where = conditions.join(' AND ');

    const { rows } = await pool.query(
      `SELECT s.id AS staff_id, s.full_name, s.staff_id_number, s.avatar_url, s.position,
              d.name AS department,
              a.id AS attendance_id, a.check_in_time, a.check_out_time,
              a.check_in_status, a.check_out_status, a.productivity_status,
              a.hours_worked, a.location_verified, a.is_override, a.override_reason
         FROM staff s
         LEFT JOIN departments d ON d.id = s.department_id
         LEFT JOIN attendance_records a ON a.staff_id = s.id AND a.work_date = $1
        WHERE ${where}
        ORDER BY s.full_name ASC`,
      params
    );

    res.json({ date: workDate, filter, records: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/override  - manually create/update an attendance record
// body: { staffId, workDate, checkInTime, checkOutTime, reason }
async function overrideAttendance(req, res, next) {
  try {
    const { staffId, workDate, checkInTime, checkOutTime, reason } = req.body;

    if (!staffId || !workDate || !reason) {
      return res.status(400).json({ message: 'staffId, workDate and reason are required for an override.' });
    }

    const checkIn = checkInTime ? new Date(checkInTime) : null;
    let checkOut = checkOutTime ? new Date(checkOutTime) : null;

    if (checkIn && !checkOut) {
      checkOut = new Date(checkIn);
      checkOut.setHours(Math.floor(WORK_END_MIN / 60), WORK_END_MIN % 60, 0, 0);
    }

    const checkInStatus = checkIn ? classifyCheckIn(checkIn) : null;
    const checkOutStatus = checkOut ? classifyCheckOut(checkOut) : null;
    const hoursWorked = checkIn && checkOut ? calculateHoursWorked(checkIn, checkOut) : 0;
    const productivity = calculateProductivity({
      checkInStatus,
      checkOutStatus,
      hasCheckIn: !!checkIn,
      hasCheckOut: !!checkOut,
    });

    const existing = await pool.query(
      'SELECT id FROM attendance_records WHERE staff_id = $1 AND work_date = $2',
      [staffId, workDate]
    );

    let record;
    if (existing.rows.length > 0) {
      const { rows } = await pool.query(
        `UPDATE attendance_records SET
            check_in_time = $1, check_out_time = $2,
            check_in_status = $3, check_out_status = $4,
            hours_worked = $5, productivity_status = $6,
            is_override = TRUE, override_reason = $7, overridden_by = $8,
            location_verified = TRUE, updated_at = NOW()
          WHERE id = $9 RETURNING *`,
        [checkIn, checkOut, checkInStatus, checkOutStatus, hoursWorked, productivity, reason, req.user.id, existing.rows[0].id]
      );
      record = rows[0];
    } else {
      const { rows } = await pool.query(
        `INSERT INTO attendance_records
            (staff_id, work_date, check_in_time, check_out_time, check_in_status, check_out_status,
             hours_worked, productivity_status, is_override, override_reason, overridden_by, location_verified)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE,$9,$10,TRUE)
         RETURNING *`,
        [staffId, workDate, checkIn, checkOut, checkInStatus, checkOutStatus, hoursWorked, productivity, reason, req.user.id]
      );
      record = rows[0];
    }

    res.status(200).json({ message: 'Attendance record updated via manual override.', record });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboardStats, getAttendanceBoard, overrideAttendance };
