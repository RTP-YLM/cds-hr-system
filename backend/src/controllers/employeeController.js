import Employee from '../models/Employee.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { deleteFile } from '../middleware/upload.js';

/**
 * Employee Controller
 */

// @desc   Get all employees
// @route  GET /api/employees
export const getEmployees = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    employment_type: req.query.employment_type,
    position_id: req.query.position_id,
    search: req.query.search
  };

  const employees = await Employee.getAll(filters);

  res.json({
    success: true,
    count: employees.length,
    data: employees
  });
});

// @desc   Get single employee
// @route  GET /api/employees/:id
export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.getById(req.params.id);

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลพนักงาน'
    });
  }

  res.json({
    success: true,
    data: employee
  });
});

// @desc   Create new employee
// @route  POST /api/employees
export const createEmployee = asyncHandler(async (req, res) => {
  const data = req.validatedData;

  // เช็คว่ามีเลขบัตรประชาชนซ้ำหรือไม่
  const existing = await Employee.getByIdCard(data.id_card_number);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'เลขบัตรประชาชนนี้มีในระบบแล้ว'
    });
  }

  // จัดการ file uploads
  if (req.files) {
    if (req.files.profile_image) {
      data.profile_image_url = `uploads/profiles/${req.files.profile_image[0].filename}`;
    }
    if (req.files.contract_file) {
      data.contract_file_url = `uploads/contracts/${req.files.contract_file[0].filename}`;
    }
  }

  const employee = await Employee.create(data);

  res.status(201).json({
    success: true,
    message: 'เพิ่มพนักงานสำเร็จ',
    data: employee
  });
});

// @desc   Update employee
// @route  PATCH /api/employees/:id
export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.getById(req.params.id);

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลพนักงาน'
    });
  }

  const data = req.validatedData || req.body;

  // เช็คเลขบัตรประชาชนซ้ำ (ถ้ามีการเปลี่ยน)
  if (data.id_card_number && data.id_card_number !== employee.id_card_number) {
    const existing = await Employee.getByIdCard(data.id_card_number);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'เลขบัตรประชาชนนี้มีในระบบแล้ว'
      });
    }
  }

  // จัดการ file uploads
  if (req.files) {
    if (req.files.profile_image) {
      // ลบไฟล์เก่า
      if (employee.profile_image_url) {
        deleteFile(employee.profile_image_url);
      }
      data.profile_image_url = `uploads/profiles/${req.files.profile_image[0].filename}`;
    }
    if (req.files.contract_file) {
      // ลบไฟล์เก่า
      if (employee.contract_file_url) {
        deleteFile(employee.contract_file_url);
      }
      data.contract_file_url = `uploads/contracts/${req.files.contract_file[0].filename}`;
    }
  }

  const updated = await Employee.update(req.params.id, data);

  res.json({
    success: true,
    message: 'อัพเดทข้อมูลพนักงานสำเร็จ',
    data: updated
  });
});

// @desc   Delete employee
// @route  DELETE /api/employees/:id
export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.getById(req.params.id);

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลพนักงาน'
    });
  }

  // ลบไฟล์ที่เกี่ยวข้อง
  if (employee.profile_image_url) {
    deleteFile(employee.profile_image_url);
  }
  if (employee.contract_file_url) {
    deleteFile(employee.contract_file_url);
  }

  await Employee.delete(req.params.id);

  res.json({
    success: true,
    message: 'ลบพนักงานสำเร็จ'
  });
});

// @desc   Get employee statistics
// @route  GET /api/employees/stats/overview
export const getEmployeeStats = asyncHandler(async (req, res) => {
  const [byStatus, byType] = await Promise.all([
    Employee.countByStatus(),
    Employee.countByEmploymentType()
  ]);

  res.json({
    success: true,
    data: {
      byStatus,
      byType
    }
  });
});

export default {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
};
