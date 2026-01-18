import express from 'express';
import holidayController from '../controllers/holidayController.js';

const router = express.Router();

router.get('/', holidayController.getHolidays);
router.get('/preview', holidayController.getCalendarPreview);
router.post('/', holidayController.createHoliday);
router.put('/:id', holidayController.updateHoliday);
router.delete('/:id', holidayController.deleteHoliday);

export default router;
