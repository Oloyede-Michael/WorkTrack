const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('⏳ Seeding admin and demo staff accounts...');

    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const staffPasswordHash = await bcrypt.hash('Staff@123', 10);

    await client.query('BEGIN');

    // Departments (idempotent upsert so existing DBs pick up new ones like ICT)
    const departments = [
      { name: 'Administration', description: 'General administrative services' },
      { name: 'Finance & Accounts', description: 'Revenue, budgeting and accounts' },
      { name: 'Health Services', description: 'Primary healthcare coordination' },
      { name: 'Works & Environment', description: 'Infrastructure and sanitation' },
      { name: 'Human Resources', description: 'Personnel management' },
      { name: 'ICT', description: 'Information and communication technology' },
    ];
    for (const d of departments) {
      await client.query(
        `INSERT INTO departments (name, description) VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [d.name, d.description]
      );
    }

    // Admin account
    const adminRes = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ('admin@ikorodulg.gov.ng', $1, 'admin')
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [adminPasswordHash]
    );
    if (adminRes.rows.length) {
      console.log('   ✔ Admin user created: admin@ikorodulg.gov.ng / Admin@123');
    }

    // Demo department lookup
    const deptRes = await client.query(`SELECT id, name FROM departments`);
    const deptByName = Object.fromEntries(deptRes.rows.map((d) => [d.name, d.id]));

    const demoStaff = [
      { email: 'adeola.bello@ikorodulg.gov.ng', name: 'Adeola Bello', idNo: 'ILG-2024-001', dept: 'Administration', position: 'Admin Officer II' },
      { email: 'chidi.okafor@ikorodulg.gov.ng', name: 'Chidi Okafor', idNo: 'ILG-2024-002', dept: 'Finance & Accounts', position: 'Accounts Clerk' },
      { email: 'fatima.suleiman@ikorodulg.gov.ng', name: 'Fatima Suleiman', idNo: 'ILG-2024-003', dept: 'Health Services', position: 'Community Health Officer' },
      { email: 'tunde.adewale@ikorodulg.gov.ng', name: 'Tunde Adewale', idNo: 'ILG-2024-004', dept: 'Works & Environment', position: 'Field Supervisor' },
      { email: 'ngozi.eze@ikorodulg.gov.ng', name: 'Ngozi Eze', idNo: 'ILG-2024-005', dept: 'Human Resources', position: 'HR Officer' },
    ];

    for (const s of demoStaff) {
      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, $2, 'staff')
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [s.email, staffPasswordHash]
      );
      if (userRes.rows.length) {
        await client.query(
          `INSERT INTO staff (user_id, staff_id_number, full_name, department_id, position)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (staff_id_number) DO NOTHING`,
          [userRes.rows[0].id, s.idNo, s.name, deptByName[s.dept] || null, s.position]
        );
        console.log(`   ✔ Staff created: ${s.email} / Staff@123`);
      }
    }

    await client.query('COMMIT');
    console.log('✅ Seeding complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
