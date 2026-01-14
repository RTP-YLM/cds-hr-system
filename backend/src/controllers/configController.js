import SystemConfig from '../models/SystemConfig.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * System Config Controller
 */

// @desc   Get all system configs
// @route  GET /api/config
export const getConfigs = asyncHandler(async (req, res) => {
  const configs = await SystemConfig.getAll();

  res.json({
    success: true,
    count: configs.length,
    data: configs
  });
});

// @desc   Get all configs as object
// @route  GET /api/config/object
export const getConfigsAsObject = asyncHandler(async (req, res) => {
  const configs = await SystemConfig.getAllAsObject();

  res.json({
    success: true,
    data: configs
  });
});

// @desc   Get single config
// @route  GET /api/config/:key
export const getConfig = asyncHandler(async (req, res) => {
  const config = await SystemConfig.getByKey(req.params.key);

  if (!config) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบการตั้งค่า'
    });
  }

  res.json({
    success: true,
    data: config
  });
});

// @desc   Create new config
// @route  POST /api/config
export const createConfig = asyncHandler(async (req, res) => {
  const data = req.validatedData;

  // เช็คว่ามี key ซ้ำหรือไม่
  const existing = await SystemConfig.getByKey(data.key);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'การตั้งค่านี้มีในระบบแล้ว'
    });
  }

  const config = await SystemConfig.create(data);

  res.status(201).json({
    success: true,
    message: 'เพิ่มการตั้งค่าสำเร็จ',
    data: config
  });
});

// @desc   Update config
// @route  PATCH /api/config/:key
export const updateConfig = asyncHandler(async (req, res) => {
  const config = await SystemConfig.getByKey(req.params.key);

  if (!config) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบการตั้งค่า'
    });
  }

  const data = req.validatedData || req.body;
  const updated = await SystemConfig.update(req.params.key, data);

  res.json({
    success: true,
    message: 'อัพเดทการตั้งค่าสำเร็จ',
    data: updated
  });
});

// @desc   Update multiple configs
// @route  PATCH /api/config/batch
export const updateMultipleConfigs = asyncHandler(async (req, res) => {
  const { configs } = req.body;

  if (!configs || !Array.isArray(configs)) {
    return res.status(400).json({
      success: false,
      message: 'กรุณาส่งข้อมูลในรูปแบบ array'
    });
  }

  const updated = await SystemConfig.updateMultiple(configs);

  res.json({
    success: true,
    message: 'อัพเดทการตั้งค่าสำเร็จ',
    data: updated
  });
});

// @desc   Delete config
// @route  DELETE /api/config/:key
export const deleteConfig = asyncHandler(async (req, res) => {
  const config = await SystemConfig.getByKey(req.params.key);

  if (!config) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบการตั้งค่า'
    });
  }

  await SystemConfig.delete(req.params.key);

  res.json({
    success: true,
    message: 'ลบการตั้งค่าสำเร็จ'
  });
});

// @desc   Search configs
// @route  GET /api/config/search/:keyword
export const searchConfigs = asyncHandler(async (req, res) => {
  const configs = await SystemConfig.search(req.params.keyword);

  res.json({
    success: true,
    count: configs.length,
    data: configs
  });
});

// @desc   Get configs by type
// @route  GET /api/config/type/:type
export const getConfigsByType = asyncHandler(async (req, res) => {
  const configs = await SystemConfig.getByType(req.params.type);

  res.json({
    success: true,
    count: configs.length,
    data: configs
  });
});

export default {
  getConfigs,
  getConfigsAsObject,
  getConfig,
  createConfig,
  updateConfig,
  updateMultipleConfigs,
  deleteConfig,
  searchConfigs,
  getConfigsByType
};
