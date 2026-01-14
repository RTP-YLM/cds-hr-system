import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadsDir = path.join(__dirname, '../../uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
const contractsDir = path.join(uploadsDir, 'contracts');

[uploadsDir, profilesDir, contractsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// กำหนด storage สำหรับรูปโปรไฟล์
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDir);
  },
  filename: (req, file, cb) => {
    // สร้างชื่อไฟล์ใหม่: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    // แปลงชื่อไฟล์ให้เป็น URL-safe
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `profile-${uniqueSuffix}-${safeName}${ext}`);
  }
});

// กำหนด storage สำหรับสัญญา PDF
const contractStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, contractsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `contract-${uniqueSuffix}-${safeName}${ext}`);
  }
});

// ตรวจสอบประเภทไฟล์รูปภาพ
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WebP) เท่านั้น'), false);
  }
};

// ตรวจสอบประเภทไฟล์ PDF
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('รองรับเฉพาะไฟล์ PDF เท่านั้น'), false);
  }
};

// Multer config สำหรับรูปโปรไฟล์
export const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
}).single('profile_image');

// Multer config สำหรับสัญญา PDF
export const uploadContract = multer({
  storage: contractStorage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
}).single('contract_file');

// Multer config สำหรับทั้งรูปและ PDF
export const uploadEmployeeFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'profile_image') {
        cb(null, profilesDir);
      } else if (file.fieldname === 'contract_file') {
        cb(null, contractsDir);
      } else {
        cb(new Error('Invalid field name'), false);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');

      if (file.fieldname === 'profile_image') {
        cb(null, `profile-${uniqueSuffix}-${safeName}${ext}`);
      } else if (file.fieldname === 'contract_file') {
        cb(null, `contract-${uniqueSuffix}-${safeName}${ext}`);
      }
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profile_image') {
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('รูปโปรไฟล์รองรับเฉพาะไฟล์ JPEG, PNG, GIF, WebP'), false);
      }
    } else if (file.fieldname === 'contract_file') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('ไฟล์สัญญารองรับเฉพาะ PDF'), false);
      }
    } else {
      cb(new Error('Invalid field name'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
}).fields([
  { name: 'profile_image', maxCount: 1 },
  { name: 'contract_file', maxCount: 1 }
]);

/**
 * ลบไฟล์
 * @param {string} filePath - path ของไฟล์
 */
export const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log('File deleted:', fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

/**
 * Middleware สำหรับจัดการ error จาก multer
 */
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'ขนาดไฟล์เกินกำหนด (สูงสุด 10MB)'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
};

export default {
  uploadProfile,
  uploadContract,
  uploadEmployeeFiles,
  deleteFile,
  handleMulterError
};
