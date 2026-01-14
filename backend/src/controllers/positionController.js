import Position from '../models/Position.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Position Controller
 */

// @desc   Get all positions
// @route  GET /api/positions
export const getPositions = asyncHandler(async (req, res) => {
  const positions = await Position.getAll();

  res.json({
    success: true,
    count: positions.length,
    data: positions
  });
});

// @desc   Get single position
// @route  GET /api/positions/:id
export const getPosition = asyncHandler(async (req, res) => {
  const position = await Position.getById(req.params.id);

  if (!position) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลตำแหน่ง'
    });
  }

  res.json({
    success: true,
    data: position
  });
});

// @desc   Create new position
// @route  POST /api/positions
export const createPosition = asyncHandler(async (req, res) => {
  const data = req.validatedData;

  // เช็คว่ามีชื่อตำแหน่งซ้ำหรือไม่
  const existing = await Position.getByName(data.position_name);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'ชื่อตำแหน่งนี้มีในระบบแล้ว'
    });
  }

  const position = await Position.create(data);

  res.status(201).json({
    success: true,
    message: 'เพิ่มตำแหน่งสำเร็จ',
    data: position
  });
});

// @desc   Update position
// @route  PATCH /api/positions/:id
export const updatePosition = asyncHandler(async (req, res) => {
  const position = await Position.getById(req.params.id);

  if (!position) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลตำแหน่ง'
    });
  }

  const data = req.validatedData || req.body;

  // เช็คชื่อตำแหน่งซ้ำ (ถ้ามีการเปลี่ยน)
  if (data.position_name && data.position_name !== position.position_name) {
    const existing = await Position.getByName(data.position_name);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'ชื่อตำแหน่งนี้มีในระบบแล้ว'
      });
    }
  }

  const updated = await Position.update(req.params.id, data);

  res.json({
    success: true,
    message: 'อัพเดทตำแหน่งสำเร็จ',
    data: updated
  });
});

// @desc   Delete position
// @route  DELETE /api/positions/:id
export const deletePosition = asyncHandler(async (req, res) => {
  const position = await Position.getById(req.params.id);

  if (!position) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลตำแหน่ง'
    });
  }

  // เช็คว่ามีพนักงานในตำแหน่งนี้หรือไม่
  const employees = await Position.getEmployees(req.params.id);
  if (employees.length > 0) {
    return res.status(400).json({
      success: false,
      message: `ไม่สามารถลบตำแหน่งนี้ได้ เนื่องจากมีพนักงาน ${employees.length} คนในตำแหน่งนี้`
    });
  }

  await Position.delete(req.params.id);

  res.json({
    success: true,
    message: 'ลบตำแหน่งสำเร็จ'
  });
});

// @desc   Get employees in position
// @route  GET /api/positions/:id/employees
export const getPositionEmployees = asyncHandler(async (req, res) => {
  const position = await Position.getById(req.params.id);

  if (!position) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลตำแหน่ง'
    });
  }

  const employees = await Position.getEmployees(req.params.id);

  res.json({
    success: true,
    data: {
      position,
      employees,
      count: employees.length
    }
  });
});

export default {
  getPositions,
  getPosition,
  createPosition,
  updatePosition,
  deletePosition,
  getPositionEmployees
};
