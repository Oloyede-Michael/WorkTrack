const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const pool = require('../config/db');

async function getMonthlyData(month, year, departmentId) {
  const params = [year, month];
  let deptFilter = '';
  if (departmentId) {
    params.push(departmentId);
    deptFilter = `AND s.department_id = $${params.length}`;
  }

  const { rows } = await pool.query(
    `SELECT s.staff_id_number, s.full_name, d.name AS department, s.position,
            a.work_date, a.check_in_time, a.check_out_time,
            a.check_in_status, a.check_out_status, a.productivity_status, a.hours_worked
       FROM attendance_records a
       JOIN staff s ON s.id = a.staff_id
       LEFT JOIN departments d ON d.id = s.department_id
      WHERE EXTRACT(YEAR FROM a.work_date) = $1 AND EXTRACT(MONTH FROM a.work_date) = $2
      ${deptFilter}
      ORDER BY s.full_name, a.work_date`,
    params
  );
  return rows;
}

// GET /api/reports/department-analytics?month=&year=
async function departmentAnalytics(req, res, next) {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const { rows } = await pool.query(
      `SELECT d.name AS department,
              COUNT(DISTINCT s.id)::int AS staff_count,
              COUNT(a.id)::int AS total_records,
              COUNT(a.id) FILTER (WHERE a.productivity_status = 'productive')::int AS productive,
              COUNT(a.id) FILTER (WHERE a.productivity_status = 'partial')::int AS partial,
              COUNT(a.id) FILTER (WHERE a.productivity_status = 'non_productive')::int AS non_productive,
              COALESCE(ROUND(AVG(a.hours_worked)::numeric, 2), 0) AS avg_hours,
              CASE WHEN COUNT(a.id) > 0 THEN
                ROUND((COUNT(a.id) FILTER (WHERE a.productivity_status = 'productive')::numeric / COUNT(a.id)) * 100, 1)
              ELSE 0 END AS productivity_rate
         FROM departments d
         LEFT JOIN staff s ON s.department_id = d.id AND s.is_active = TRUE
         LEFT JOIN attendance_records a ON a.staff_id = s.id
              AND EXTRACT(YEAR FROM a.work_date) = $1 AND EXTRACT(MONTH FROM a.work_date) = $2
        GROUP BY d.name ORDER BY d.name`,
      [year, month]
    );

    res.json({ month, year, departments: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/staff-ranking?month=&year=  - productivity leaderboard
async function staffRanking(req, res, next) {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const { rows } = await pool.query(
      `SELECT s.id, s.full_name, s.staff_id_number, d.name AS department,
              COUNT(a.id)::int AS total_days,
              COUNT(a.id) FILTER (WHERE a.productivity_status = 'productive')::int AS productive_days,
              COALESCE(ROUND(AVG(a.hours_worked)::numeric,2),0) AS avg_hours,
              CASE WHEN COUNT(a.id) > 0 THEN
                ROUND((COUNT(a.id) FILTER (WHERE a.productivity_status = 'productive')::numeric / COUNT(a.id)) * 100, 1)
              ELSE 0 END AS productivity_rate
         FROM staff s
         LEFT JOIN departments d ON d.id = s.department_id
         LEFT JOIN attendance_records a ON a.staff_id = s.id
              AND EXTRACT(YEAR FROM a.work_date) = $1 AND EXTRACT(MONTH FROM a.work_date) = $2
        WHERE s.is_active = TRUE
        GROUP BY s.id, d.name
        ORDER BY productivity_rate DESC, productive_days DESC
        LIMIT 20`,
      [year, month]
    );

    res.json({ month, year, ranking: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/export/csv?month=&year=&departmentId=
async function exportCsv(req, res, next) {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const data = await getMonthlyData(month, year, req.query.departmentId);

    const fields = [
      { label: 'Staff ID', value: 'staff_id_number' },
      { label: 'Full Name', value: 'full_name' },
      { label: 'Department', value: 'department' },
      { label: 'Position', value: 'position' },
      { label: 'Date', value: (row) => row.work_date?.toISOString().slice(0, 10) },
      { label: 'Check-In', value: (row) => (row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString() : '') },
      { label: 'Check-Out', value: (row) => (row.check_out_time ? new Date(row.check_out_time).toLocaleTimeString() : '') },
      { label: 'Check-In Status', value: 'check_in_status' },
      { label: 'Check-Out Status', value: 'check_out_status' },
      { label: 'Hours Worked', value: 'hours_worked' },
      { label: 'Productivity', value: 'productivity_status' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`WorkTrack_Attendance_${year}-${String(month).padStart(2, '0')}.csv`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/export/pdf?month=&year=&departmentId=
async function exportPdf(req, res, next) {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const data = await getMonthlyData(month, year, req.query.departmentId);
    const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.header('Content-Type', 'application/pdf');
    res.attachment(`WorkTrack_Attendance_${year}-${String(month).padStart(2, '0')}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).fillColor('#0F3D2E').text('WorkTrack — Ikorodu Local Government Secretariat', { align: 'left' });
    doc.fontSize(12).fillColor('#333').text(`Monthly Attendance Summary Report — ${monthName} ${year}`);
    doc.moveDown(1);

    const tableTop = doc.y;
    const colWidths = [70, 120, 100, 70, 65, 65, 70, 70, 60];
    const headers = ['Staff ID', 'Name', 'Department', 'Date', 'Check-In', 'Check-Out', 'In Status', 'Out Status', 'Hours'];

    let x = 40;
    doc.fontSize(9).fillColor('#fff');
    doc.rect(40, tableTop, colWidths.reduce((a, b) => a + b, 0), 20).fill('#0F3D2E');
    doc.fillColor('#fff');
    headers.forEach((h, i) => {
      doc.text(h, x + 4, tableTop + 6, { width: colWidths[i] - 4 });
      x += colWidths[i];
    });

    let y = tableTop + 22;
    doc.fontSize(8).fillColor('#1a1a1a');

    data.forEach((row, idx) => {
      if (y > 520) {
        doc.addPage({ margin: 40, size: 'A4', layout: 'landscape' });
        y = 40;
      }
      if (idx % 2 === 0) {
        doc.rect(40, y - 2, colWidths.reduce((a, b) => a + b, 0), 16).fill('#F7F5EF');
        doc.fillColor('#1a1a1a');
      }
      let cx = 40;
      const values = [
        row.staff_id_number,
        row.full_name,
        row.department || '-',
        row.work_date ? new Date(row.work_date).toISOString().slice(0, 10) : '-',
        row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString() : '-',
        row.check_out_time ? new Date(row.check_out_time).toLocaleTimeString() : '-',
        row.check_in_status || '-',
        row.check_out_status || '-',
        String(row.hours_worked ?? 0),
      ];
      values.forEach((v, i) => {
        doc.text(String(v), cx + 4, y, { width: colWidths[i] - 4 });
        cx += colWidths[i];
      });
      y += 16;
    });

    doc.end();
  } catch (err) {
    next(err);
  }
}

module.exports = { departmentAnalytics, staffRanking, exportCsv, exportPdf };
