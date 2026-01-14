import express from 'express';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
} from '../controllers/employeeController.js';
import { validateBody } from '../utils/validators.js';
import { employeeSchema, employeeUpdateSchema } from '../utils/validators.js';
import { uploadEmployeeFiles, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// Stats route ต้องอยู่ก่อน /:id
router.get('/stats/overview', getEmployeeStats);

// CRUD routes
router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.post('/',
  uploadEmployeeFiles,
  handleMulterError,
  validateBody(employeeSchema),
  createEmployee
);
router.patch('/:id',
  uploadEmployeeFiles,
  handleMulterError,
  validateBody(employeeUpdateSchema),
  updateEmployee
);
router.delete('/:id', deleteEmployee);

export default router;
