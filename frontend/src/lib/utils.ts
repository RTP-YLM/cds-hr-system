import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function สำหรับรวม className
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format ตัวเลขเป็นเงินบาท
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format วันที่เป็นภาษาไทย
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format วันที่แบบสั้น (DD/MM/YYYY)
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Format เวลา (HH:MM)
 */
export function formatTime(timeString?: string): string {
  if (!timeString) return '-';
  return timeString.substring(0, 5);
}

/**
 * แปลงสถานะพนักงานเป็นภาษาไทย
 */
export function translateEmployeeStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'probation': 'ทดลองงาน',
    'internship': 'ฝึกงาน',
    'part-time': 'พาร์ทไทม์',
    'permanent': 'พนักงานประจำ',
    'resigned': 'ลาออก',
  };
  return statusMap[status] || status;
}

/**
 * แปลงประเภทการจ้างเป็นภาษาไทย
 */
export function translateEmploymentType(type: string): string {
  const typeMap: Record<string, string> = {
    'daily': 'รายวัน',
    'monthly': 'รายเดือน',
  };
  return typeMap[type] || type;
}

/**
 * แปลงประเภทการลาเป็นภาษาไทย
 */
export function translateLeaveType(type: string): string {
  const leaveMap: Record<string, string> = {
    'sick': 'ลาป่วย',
    'personal': 'ลากิจ',
    'vacation': 'ลาพักร้อน',
  };
  return leaveMap[type] || type;
}

/**
 * คำนวณอายุจากวันเกิด
 */
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * คำนวณอายุงาน
 */
export function calculateWorkYears(hiredDate: string): number {
  const today = new Date();
  const hired = new Date(hiredDate);
  let years = today.getFullYear() - hired.getFullYear();
  const monthDiff = today.getMonth() - hired.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hired.getDate())) {
    years--;
  }

  return years;
}

/**
 * Validate เลขบัตรประชาชนไทย
 */
export function validateIdCard(idCard: string): boolean {
  if (!/^\d{13}$/.test(idCard)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(idCard.charAt(i)) * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(idCard.charAt(12));
}

/**
 * Validate เบอร์โทรศัพท์ไทย
 */
export function validatePhoneNumber(phone: string): boolean {
  return /^0\d{9}$/.test(phone);
}

/**
 * Format เบอร์โทรศัพท์
 */
export function formatPhoneNumber(phone: string): string {
  if (phone.length !== 10) return phone;
  return `${phone.substring(0, 3)}-${phone.substring(3, 6)}-${phone.substring(6)}`;
}

/**
 * Get month options สำหรับ select
 */
export function getMonthOptions(yearsBack: number = 2): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  const today = new Date();

  for (let i = 0; i < yearsBack * 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long'
    }).format(date);

    options.push({ value, label });
  }

  return options;
}

/**
 * Download file จาก URL
 */
export function downloadFile(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: any;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
