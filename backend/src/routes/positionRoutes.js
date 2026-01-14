import express from 'express';
import {
  getPositions,
  getPosition,
  createPosition,
  updatePosition,
  deletePosition,
  getPositionEmployees
} from '../controllers/positionController.js';
import { validateBody } from '../utils/validators.js';
import { positionSchema } from '../utils/validators.js';

const router = express.Router();

// CRUD routes
router.get('/', getPositions);
router.get('/:id', getPosition);
router.get('/:id/employees', getPositionEmployees);
router.post('/',
  validateBody(positionSchema),
  createPosition
);
router.patch('/:id',
  validateBody(positionSchema.partial()),
  updatePosition
);
router.delete('/:id', deletePosition);

export default router;
