import { Holiday } from '../models/Holiday.js';
import { SystemConfig } from '../models/SystemConfig.js';
import { calculateWorkDaysInMonth } from '../utils/payrollCalculator.js';

export const getHolidays = async (req, res) => {
    try {
        const { year } = req.query;
        const holidays = await Holiday.getAll(year);
        res.json(holidays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.create(req.body);
        res.status(201).json(holiday);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.update(req.params.id, req.body);
        if (!holiday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }
        res.json(holiday);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getCalendarPreview = async (req, res) => {
    try {
        const year = parseInt(req.query.year || new Date().getFullYear());
        const holidays = await Holiday.getAll(year);
        const configs = await SystemConfig.getAllAsObject();

        const holidayDates = holidays.map(h => {
            const d = new Date(h.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        });

        const weeklyOffDays = configs.weekly_off_days || [0];
        const saturdayMode = configs.saturday_work_mode || 'biweekly';

        const calendar = [];
        // วนลูปทุกเดือนในปี
        for (let month = 1; month <= 12; month++) {
            const daysInMonth = new Date(year, month, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month - 1, day);
                date.setHours(12, 0, 0, 0);
                const dayOfWeek = date.getDay();

                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                let reason = null;
                const holidayFound = holidays.find(h => {
                    const hd = new Date(h.date);
                    return hd.getFullYear() === year && hd.getMonth() + 1 === month && hd.getDate() === day;
                });

                if (holidayFound) {
                    reason = `วันหยุดนักขัตฤกษ์: ${holidayFound.name}`;
                } else if (dayOfWeek !== 6 && weeklyOffDays.includes(dayOfWeek)) {
                    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
                    reason = `วันหยุดประจำสัปดาห์ (วัน${dayNames[dayOfWeek]})`;
                } else if (dayOfWeek === 6) {
                    if (saturdayMode === 'none') {
                        reason = 'วันหยุดประจำสัปดาห์ (วันเสาร์)';
                    } else if (saturdayMode === 'biweekly') {
                        const weekIndex = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
                        if (weekIndex % 2 === 0) {
                            reason = 'วันหยุดประจำสัปดาห์ (เสาร์เว้นเสาร์)';
                        }
                    }
                }

                if (reason) {
                    calendar.push({
                        date: dateStr,
                        dayOfWeek,
                        reason
                    });
                }
            }
        }

        res.json({
            year,
            totalOffDays: calendar.length,
            offDays: calendar
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.delete(req.params.id);
        if (!holiday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }
        res.json({ message: 'Holiday deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    getHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    getCalendarPreview
};
