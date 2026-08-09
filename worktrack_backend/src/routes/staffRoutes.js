const express = require('express');
const {
  listStaff, getStaffById, createStaff, updateStaff,
  deactivateStaff, deleteStaff, listDepartments, createDepartment,
} = require('../controllers/staffController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/departments', listDepartments);
router.post('/departments', createDepartment);

router.get('/', listStaff);
router.post('/', createStaff);
router.get('/:id', getStaffById);
router.put('/:id', updateStaff);
router.patch('/:id/deactivate', deactivateStaff);
router.delete('/:id', deleteStaff);

module.exports = router;
