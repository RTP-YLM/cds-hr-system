import express from 'express';
import {
  getAttendanceRecords,
  getAttendanceByMonth,
  getAttendanceByRange,
  getAttendance,
  createAttendance,
  updateAttendance,
  batchUpsertAttendance,
  deleteAttendance,
  getAttendanceSummary
} from '../controllers/attendanceController.js';
import { validateBody, validateQuery, validateParams } from '../utils/validators.js';
import {
  attendanceSchema,
  attendanceUpdateSchema,
  batchAttendanceSchema,
  attendanceQuerySchema,
  attendanceRangeQuerySchema
} from '../utils/validators.js';

const router = express.Router();

// Summary route
router.get('/summary/:employee_id/:month', getAttendanceSummary);

// Get by employee and range
router.get('/employee/:employee_id/range',
  validateQuery(attendanceRangeQuerySchema),
  getAttendanceByRange
);

// Get by employee and month
router.get('/employee/:employee_id/:month',
  validateParams(attendanceQuerySchema),
  getAttendanceByMonth
);

// Batch route
router.post('/batch',
  validateBody(batchAttendanceSchema),
  batchUpsertAttendance
);

// CRUD routes
router.get('/', getAttendanceRecords);
router.post('/',
  validateBody(attendanceSchema),
  createAttendance
);
router.get('/:id', getAttendance);
router.patch('/:id',
  validateBody(attendanceUpdateSchema),
  updateAttendance
);
router.delete('/:id', deleteAttendance);

export default router;
