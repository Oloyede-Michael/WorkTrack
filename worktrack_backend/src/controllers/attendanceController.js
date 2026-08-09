const pool = require('../config/db');
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

async function getStaffIdForUser(userId) {
  const { rows } = await pool.query('SELECT id FROM staff WHERE user_id = $1', [userId]);
  return rows[0]?.id || null;
}

// GET /api/attendance/today
async function getToday(req, res, next) {
  try {
    const staffId = req.user.staffId || (await getStaffIdForUser(req.user.id));
    if (!staffId) return res.status(404).json({ message: 'Staff profile not found.' });

    const { rows } = await pool.query(
      `SELECT * FROM attendance_records WHERE staff_id = $1 AND work_date = $2`,
      [staffId, todayDateString()]
    );

    res.json({ record: rows[0] || null, serverTime: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

// POST /api/attendance/check-in  { latitude, longitude }
async function checkIn(req, res, next) {
  try {
    const staffId = req.user.staffId || (await getStaffIdForUser(req.user.id));
    if (!staffId) return res.status(404).json({ message: 'Staff profile not found.' });

    const { latitude, longitude } = req.body;
    const now = new Date();
    const workDate = todayDateString();

    const existing = await pool.query(
      'SELECT * FROM attendance_records WHERE staff_id = $1 AND work_date = $2',
      [staffId, workDate]
    );
    if (existing.rows.length > 0 && existing.rows[0].check_in_time) {
      return res.status(409).json({ message: 'You have already checked in today.' });
    }

    const checkInStatus = classifyCheckIn(now);

    let record;
    if (existing.rows.length > 0) {
      const { rows } = await pool.query(
        `UPDATE attendance_records
            SET check_in_time = $1, check_in_status = $2,
                check_in_lat = $3, check_in_lng = $4, check_in_distance_m = $5,
                location_verified = $6, productivity_status = 'non_productive',
                updated_at = NOW()
          WHERE id = $7 RETURNING *`,
        [now, checkInStatus, latitude || null, longitude || null, null, true, existing.rows[0].id]
      );
      record = rows[0];
    } else {
      const { rows } = await pool.query(
        `INSERT INTO attendance_records
            (staff_id, work_date, check_in_time, check_in_status,
             check_in_lat, check_in_lng, check_in_distance_m, location_verified, productivity_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'non_productive')
         RETURNING *`,
        [staffId, workDate, now, checkInStatus, latitude || null, longitude || null, null, true]
      );
      record = rows[0];
    }

    res.status(201).json({
      message:
        checkInStatus === 'on_time'
          ? 'Checked in successfully. You are on time!'
          : checkInStatus === 'late'
          ? 'Checked in. You are marked late today.'
          : 'Checked in. You are marked half-day due to late arrival.',
      record,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/attendance/check-out
async function checkOut(req, res, next) {
  try {
    const staffId = req.user.staffId || (await getStaffIdForUser(req.user.id));
    if (!staffId) return res.status(404).json({ message: 'Staff profile not found.' });

    const workDate = todayDateString();
    const existing = await pool.query(
      'SELECT * FROM attendance_records WHERE staff_id = $1 AND work_date = $2',
      [staffId, workDate]
    );

    if (existing.rows.length === 0 || !existing.rows[0].check_in_time) {
      return res.status(400).json({ message: 'You must check in before you can check out.' });
    }
    if (existing.rows[0].check_out_time) {
      return res.status(409).json({ message: 'You have already checked out today.' });
    }

    const now = new Date();
    const record = existing.rows[0];
    const checkOutStatus = classifyCheckOut(now);
    const hoursWorked = calculateHoursWorked(record.check_in_time, now);
    const productivity = calculateProductivity({
      checkInStatus: record.check_in_status,
      checkOutStatus,
      hasCheckIn: true,
      hasCheckOut: true,
    });

    const { rows } = await pool.query(
      `UPDATE attendance_records
          SET check_out_time = $1, check_out_status = $2,
              hours_worked = $3, productivity_status = $4, updated_at = NOW()
        WHERE id = $5 RETURNING *`,
      [now, checkOutStatus, hoursWorked, productivity, record.id]
    );

    res.json({
      message:
        productivity === 'productive'
          ? 'Checked out. Great job — a fully productive day!'
          : 'Checked out successfully.',
      record: rows[0],
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/attendance/history?month=&year=&page=&limit=
async function getHistory(req, res, next) {
  try {
    const staffId = req.params.staffId || req.user.staffId || (await getStaffIdForUser(req.user.id));
    if (!staffId) return res.status(404).json({ message: 'Staff profile not found.' });

    const { month, year, page = 1, limit = 31 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = ['staff_id = $1'];
    const params = [staffId];

    if (year) {
      params.push(parseInt(year));
      conditions.push(`EXTRACT(YEAR FROM work_date) = $${params.length}`);
    }
    if (month) {
      params.push(parseInt(month));
      conditions.push(`EXTRACT(MONTH FROM work_date) = $${params.length}`);
    }

    const where = conditions.join(' AND ');

    const { rows } = await pool.query(
      `SELECT * FROM attendance_records WHERE ${where}
        ORDER BY work_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, parseInt(limit), offset]
    );

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM attendance_records WHERE ${where}`,
      params
    );

    const summary = await pool.query(
      `SELECT
          COUNT(*) FILTER (WHERE productivity_status = 'productive')::int AS productive,
          COUNT(*) FILTER (WHERE productivity_status = 'partial')::int AS partial,
          COUNT(*) FILTER (WHERE productivity_status = 'non_productive')::int AS non_productive,
          COUNT(*) FILTER (WHERE productivity_status = 'absent')::int AS absent,
          COALESCE(SUM(hours_worked),0)::float AS total_hours
        FROM attendance_records WHERE ${where}`,
      params
    );

    res.json({
      records: rows,
      total: countRes.rows[0].total,
      summary: summary.rows[0],
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getToday, checkIn, checkOut, getHistory };
