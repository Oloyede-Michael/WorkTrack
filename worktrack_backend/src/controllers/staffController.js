const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /api/staff  (admin) - list all staff with department + optional search
async function listStaff(req, res, next) {
  try {
    const { search = '', departmentId, status } = req.query;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      conditions.push(`(LOWER(s.full_name) LIKE $${params.length} OR LOWER(s.staff_id_number) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length})`);
    }
    if (departmentId) {
      params.push(departmentId);
      conditions.push(`s.department_id = $${params.length}`);
    }
    if (status === 'active') conditions.push('s.is_active = TRUE');
    if (status === 'inactive') conditions.push('s.is_active = FALSE');

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT s.id, s.staff_id_number, s.full_name, s.position, s.phone, s.avatar_url,
              s.date_joined, s.is_active, s.department_id,
              d.name AS department_name, u.id AS user_id, u.email, u.role
         FROM staff s
         JOIN users u ON u.id = s.user_id
         LEFT JOIN departments d ON d.id = s.department_id
         ${where}
         ORDER BY s.full_name ASC`,
      params
    );

    res.json({ staff: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/staff/:id
async function getStaffById(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, d.name AS department_name, u.email, u.role, u.is_active AS account_active
         FROM staff s
         JOIN users u ON u.id = s.user_id
         LEFT JOIN departments d ON d.id = s.department_id
        WHERE s.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Staff member not found.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/staff  (admin) - create staff + linked user account
async function createStaff(req, res, next) {
  const client = await pool.connect();
  try {
    const {
      email,
      password,
      fullName,
      staffIdNumber,
      departmentId,
      position,
      phone,
      role = 'staff',
    } = req.body;

    if (!email || !password || !fullName || !staffIdNumber) {
      return res.status(400).json({
        message: 'email, password, fullName and staffIdNumber are required.',
      });
    }

    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(password, 10);
    const userRes = await client.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3) RETURNING id, email, role`,
      [email.toLowerCase().trim(), passwordHash, role]
    );

    const staffRes = await client.query(
      `INSERT INTO staff (user_id, staff_id_number, full_name, department_id, position, phone)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [userRes.rows[0].id, staffIdNumber, fullName, departmentId || null, position || null, phone || null]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Staff member created successfully.',
      staff: { ...staffRes.rows[0], email: userRes.rows[0].email, role: userRes.rows[0].role },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

// PUT /api/staff/:id (admin) - edit staff profile
async function updateStaff(req, res, next) {
  try {
    const { fullName, departmentId, position, phone, staffIdNumber } = req.body;

    const { rows } = await pool.query(
      `UPDATE staff SET
          full_name = COALESCE($1, full_name),
          department_id = COALESCE($2, department_id),
          position = COALESCE($3, position),
          phone = COALESCE($4, phone),
          staff_id_number = COALESCE($5, staff_id_number),
          updated_at = NOW()
        WHERE id = $6 RETURNING *`,
      [fullName, departmentId, position, phone, staffIdNumber, req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Staff member not found.' });
    res.json({ message: 'Staff member updated.', staff: rows[0] });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/staff/:id/deactivate  (admin) - soft delete
async function deactivateStaff(req, res, next) {
  try {
    const { rows } = await pool.query(
      `UPDATE staff SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Staff member not found.' });

    await pool.query(
      `UPDATE users SET is_active = $1 WHERE id = (SELECT user_id FROM staff WHERE id = $2)`,
      [rows[0].is_active, req.params.id]
    );

    res.json({
      message: rows[0].is_active ? 'Staff member reactivated.' : 'Staff member deactivated.',
      staff: rows[0],
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/staff/:id (admin) - hard delete
async function deleteStaff(req, res, next) {
  try {
    const staffRes = await pool.query('SELECT user_id FROM staff WHERE id = $1', [req.params.id]);
    if (staffRes.rows.length === 0) return res.status(404).json({ message: 'Staff member not found.' });

    await pool.query('DELETE FROM users WHERE id = $1', [staffRes.rows[0].user_id]);
    res.json({ message: 'Staff member permanently deleted.' });
  } catch (err) {
    next(err);
  }
}

// ---- Departments ----

async function listDepartments(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT d.*, COUNT(s.id)::int AS staff_count
         FROM departments d
         LEFT JOIN staff s ON s.department_id = d.id AND s.is_active = TRUE
        GROUP BY d.id ORDER BY d.name`
    );
    res.json({ departments: rows });
  } catch (err) {
    next(err);
  }
}

async function createDepartment(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name is required.' });

    const { rows } = await pool.query(
      `INSERT INTO departments (name, description) VALUES ($1,$2) RETURNING *`,
      [name, description || null]
    );
    res.status(201).json({ department: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deactivateStaff,
  deleteStaff,
  listDepartments,
  createDepartment,
};
