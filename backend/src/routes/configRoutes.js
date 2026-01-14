import express from 'express';
import {
  getConfigs,
  getConfigsAsObject,
  getConfig,
  createConfig,
  updateConfig,
  updateMultipleConfigs,
  deleteConfig,
  searchConfigs,
  getConfigsByType
} from '../controllers/configController.js';
import { validateBody } from '../utils/validators.js';
import { systemConfigSchema } from '../utils/validators.js';

const router = express.Router();

// Batch update
router.patch('/batch', updateMultipleConfigs);

// Get as object
router.get('/object', getConfigsAsObject);

// Search
router.get('/search/:keyword', searchConfigs);

// Get by type
router.get('/type/:type', getConfigsByType);

// CRUD routes
router.get('/', getConfigs);
router.get('/:key', getConfig);
router.post('/',
  validateBody(systemConfigSchema),
  createConfig
);
router.patch('/:key',
  validateBody(systemConfigSchema.partial()),
  updateConfig
);
router.delete('/:key', deleteConfig);

export default router;
