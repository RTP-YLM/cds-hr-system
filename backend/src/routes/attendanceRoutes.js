import express from 'express';
import {
  getAttendanceRecords,
  getAttendanceByMonth,
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceSummary
} from '../controllers/attendanceController.js';
import { validateBody, validateQuery, validateParams } from '../utils/validators.js';
import {
  attendanceSchema,
  attendanceUpdateSchema,
  attendanceQuerySchema
} from '../utils/validators.js';

const router = express.Router();

// Summary route
router.get('/summary/:employee_id/:month', getAttendanceSummary);

// Get by employee and month
router.get('/employee/:employee_id/:month',
  validateParams(attendanceQuerySchema),
  getAttendanceByMonth
);

// CRUD routes
router.get('/', getAttendanceRecords);
router.get('/:id', getAttendance);
router.post('/',
  validateBody(attendanceSchema),
  createAttendance
);
router.patch('/:id',
  validateBody(attendanceUpdateSchema),
  updateAttendance
);
router.delete('/:id', deleteAttendance);

export default router;
