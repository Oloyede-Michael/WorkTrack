const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { signToken } = require('../utils/jwt');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.role, u.is_active,
              s.id AS staff_id, s.full_name, s.staff_id_number, s.department_id,
              s.position, s.avatar_url,
              d.name AS department_name
         FROM users u
         LEFT JOIN staff s ON s.user_id = u.id
         LEFT JOIN departments d ON d.id = s.department_id
        WHERE u.email = $1`,
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: 'This account has been deactivated. Contact an administrator.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      staffId: user.staff_id || null,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        staffId: user.staff_id,
        fullName: user.full_name,
        staffIdNumber: user.staff_id_number,
        department: user.department_name,
        position: user.position,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/register - staff self-service account creation
async function register(req, res, next) {
  const client = await pool.connect();
  try {
    const { email, password, fullName, staffIdNumber, departmentId, position, phone } = req.body;

    if (!email || !password || !fullName || !staffIdNumber) {
      return res.status(400).json({ message: 'Email, password, full name and staff ID are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedStaffId = String(staffIdNumber).trim();

    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in instead.' });
    }

    const existingStaff = await client.query('SELECT id FROM staff WHERE staff_id_number = $1', [normalizedStaffId]);
    if (existingStaff.rows.length > 0) {
      return res.status(409).json({ message: 'This staff ID is already registered.' });
    }

    let deptId = null;
    if (departmentId) {
      const deptRes = await client.query('SELECT id FROM departments WHERE id = $1', [departmentId]);
      if (deptRes.rows.length === 0) {
        return res.status(400).json({ message: 'Please select a valid department.' });
      }
      deptId = departmentId;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await client.query('BEGIN');

    const userRes = await client.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1,$2,'staff') RETURNING id, email, role`,
      [normalizedEmail, passwordHash]
    );

    const staffRes = await client.query(
      `INSERT INTO staff (user_id, staff_id_number, full_name, department_id, position, phone)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [userRes.rows[0].id, normalizedStaffId, fullName, deptId, position || null, phone || null]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Account created successfully. You can now sign in.',
      user: {
        id: userRes.rows[0].id,
        email: userRes.rows[0].email,
        role: userRes.rows[0].role,
        staffId: staffRes.rows[0].id,
        staffIdNumber: staffRes.rows[0].staff_id_number,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

// GET /api/auth/departments - public department list for self-registration
async function listDepartments(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT id, name FROM departments ORDER BY name');
    res.json({ departments: rows });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.role,
              s.id AS staff_id, s.full_name, s.staff_id_number, s.department_id,
              s.position, s.avatar_url, s.date_joined,
              d.name AS department_name
         FROM users u
         LEFT JOIN staff s ON s.user_id = u.id
         LEFT JOIN departments d ON d.id = s.department_id
        WHERE u.id = $1`,
      [req.user.id]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    const user = rows[0];

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      staffId: user.staff_id,
      fullName: user.full_name,
      staffIdNumber: user.staff_id_number,
      department: user.department_name,
      departmentId: user.department_id,
      position: user.position,
      avatarUrl: user.avatar_url,
      dateJoined: user.date_joined,
    });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });

    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect.' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      newHash,
      req.user.id,
    ]);

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, register, listDepartments, me, changePassword };
