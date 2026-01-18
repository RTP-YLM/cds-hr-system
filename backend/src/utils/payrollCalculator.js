/**
 * Payroll Calculator
 * คำนวณเงินเดือน, ค่าจ้าง, การหัก, และ OT
 */

/**
 * คำนวณนาทีที่สาย
 * @param {string} checkInTime - เวลาเข้างานจริง (HH:MM:SS)
 * @param {string} standardTime - เวลาเข้างานมาตรฐาน (HH:MM:SS)
 * @returns {number} จำนวนนาทีที่สาย
 */
export function calculateLateMinutes(checkInTime, standardTime = '08:00:00') {
  if (!checkInTime) return 0;

  const checkIn = new Date(`1970-01-01T${checkInTime}`);
  const standard = new Date(`1970-01-01T${standardTime}`);

  if (checkIn <= standard) return 0;

  const diffMs = checkIn - standard;
  const diffMinutes = Math.floor(diffMs / 1000 / 60);

  return diffMinutes;
}

/**
 * คำนวณค่าปรับสาย
 * @param {number} lateMinutes - จำนวนนาทีที่สาย
 * @param {number} finePerMinute - ค่าปรับต่อนาที
 * @returns {number} ยอดเงินค่าปรับ
 */
export function calculateLateFine(lateMinutes, finePerMinute = 2.0) {
  return lateMinutes * finePerMinute;
}

/**
 * คำนวณ OT
 * @param {number} otHours - จำนวนชั่วโมง OT
 * @param {number} hourlyRate - อัตราค่าแรงต่อชั่วโมง
 * @param {number} multiplier - ตัวคูณ OT (default 1.5)
 * @returns {number} เงิน OT
 */
export function calculateOT(otHours, hourlyRate, multiplier = 1.5) {
  return otHours * hourlyRate * multiplier;
}

/**
 * คำนวณอัตราต่อชั่วโมง สำหรับพนักงานรายวัน
 * @param {number} dailyWage - ค่าแรงรายวัน
 * @param {number} workHoursPerDay - จำนวนชั่วโมงทำงานต่อวัน
 * @returns {number} อัตราต่อชั่วโมง
 */
export function calculateHourlyRate(dailyWage, workHoursPerDay = 8) {
  return dailyWage / workHoursPerDay;
}

/**
 * คำนวณจำนวนวันทำงานในเดือน (หักวันหยุดประจำสัปดาห์และวันหยุดนักขัตฤกษ์)
 * @param {number} year 
 * @param {number} month (1-12)
 * @param {object} options
 * @param {number[]} options.weeklyOffDays (e.g. [0] for Sunday)
 * @param {string[]} options.holidayDates (Array of date [YYYY-MM-DD])
 * @param {string} options.saturdayMode ('all', 'none', 'biweekly')
 * @returns {number} จำนวนวันทำงาน
 */
export function calculateWorkDaysInMonth(year, month, options = {}) {
  const {
    weeklyOffDays = [0],
    holidayDates = [],
    saturdayMode = 'biweekly'
  } = options;

  const daysInMonth = new Date(year, month, 0).getDate();
  let workDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    date.setHours(12, 0, 0, 0);
    const dayOfWeek = date.getDay();

    const Y = date.getFullYear();
    const M = String(date.getMonth() + 1).padStart(2, '0');
    const D = String(date.getDate()).padStart(2, '0');
    const dateStr = `${Y}-${M}-${D}`;

    // 1. เช็ควันหยุดประจำสัปดาห์ (ไม่ใช่เสาร์)
    if (dayOfWeek !== 6 && weeklyOffDays.includes(dayOfWeek)) continue;

    // 2. เช็คกรณีวันเสาร์ (dayOfWeek === 6)
    if (dayOfWeek === 6) {
      if (saturdayMode === 'none') continue;
      if (saturdayMode === 'all') {
        if (weeklyOffDays.includes(6)) continue;
      } else if (saturdayMode === 'biweekly') {
        // เสาร์เว้นเสาร์ (เสาร์คู่หยุด โดยนับสัปดาห์จาก Epoch)
        const weekIndex = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
        if (weekIndex % 2 === 0) continue;
      }
    }

    // 3. เช็ควันหยุดนักขัตฤกษ์
    if (holidayDates.includes(dateStr)) continue;

    workDays++;
  }

  return workDays;
}

/**
 * คำนวณอัตราต่อชั่วโมง สำหรับพนักงานรายเดือน
 * @param {number} monthlySalary - เงินเดือนรายเดือน
 * @param {number} workDaysPerMonth - จำนวนวันทำงานต่อเดือน
 * @param {number} workHoursPerDay - จำนวนชั่วโมงทำงานต่อวัน
 * @returns {number} อัตราต่อชั่วโมง
 */
export function calculateHourlyRateFromSalary(monthlySalary, workDaysPerMonth = 26, workHoursPerDay = 8) {
  const dailyRate = monthlySalary / (workDaysPerMonth || 26);
  return dailyRate / (workHoursPerDay || 8);
}

/**
 * คำนวณการหักเงินจากการลา
 * @param {boolean} isLeave - ลาหรือไม่
 * @param {string} leaveType - ประเภทการลา (sick, personal, vacation)
 * @param {number} dailyAmount - จำนวนเงินรายวัน
 * @param {object} configs - การตั้งค่าระบบ
 * @returns {number} จำนวนเงินที่หัก
 */
export function calculateLeaveDeduction(isLeave, leaveType, dailyAmount, configs) {
  if (!isLeave) return 0;

  let deductionPercent = 0;

  switch (leaveType) {
    case 'sick':
    case 'ลาป่วย':
      deductionPercent = parseFloat(configs.leave_sick_deduction || 0);
      break;
    case 'personal':
    case 'ลากิจ':
      deductionPercent = parseFloat(configs.leave_personal_deduction || 100);
      break;
    case 'vacation':
    case 'ลาพักร้อน':
      deductionPercent = parseFloat(configs.leave_vacation_deduction || 0);
      break;
    default:
      deductionPercent = 100; // หักเต็มถ้าไม่ระบุประเภท
  }

  return (dailyAmount * deductionPercent) / 100;
}

/**
 * คำนวณรายได้รายวัน (Daily Wage Calculation)
 * สำหรับพนักงานรายวัน
 */
export function calculateDailyWage(params, configs) {
  const {
    dailyWage,
    mealAllowance = 0,
    otHours = 0,
    lateMinutes = 0,
    isLeave = false,
    leaveType = null
  } = params;

  const hourlyRate = calculateHourlyRate(
    dailyWage,
    parseFloat(configs.daily_work_hours || 8)
  );

  const otAmount = calculateOT(
    otHours,
    hourlyRate,
    parseFloat(configs.ot_rate_multiplier || 1.5)
  );

  const lateFine = calculateLateFine(
    lateMinutes,
    parseFloat(configs.late_fine_per_minute || 2.0)
  );

  let baseAmount = dailyWage;

  const leaveDeduction = calculateLeaveDeduction(
    isLeave,
    leaveType,
    dailyWage + mealAllowance,
    configs
  );

  const totalIncome = baseAmount + mealAllowance + otAmount;
  const totalDeduction = lateFine + leaveDeduction;
  const netAmount = totalIncome - totalDeduction;

  return {
    baseAmount,
    mealAllowance,
    otAmount,
    totalIncome,
    lateFine,
    leaveDeduction,
    totalDeduction,
    netAmount: Math.max(0, netAmount),
    details: {
      hourlyRate,
      otHours,
      lateMinutes
    }
  };
}

/**
 * คำนวณรายได้รายเดือน (Monthly Salary Calculation)
 */
export function calculateMonthlySalary(params, configs, calculatedWorkDays) {
  const {
    monthlySalary,
    monthlyAllowance = 0,
    daysAttended = 0,
    mealAllowancePerDay = 0,
    totalOTAmount = 0,
    totalLateFine = 0,
    totalLeaveDeduction = 0
  } = params;

  // ใช้ค่าที่คำนวณมา ถ้าไม่มีให้ default 26
  const workDaysPerMonth = calculatedWorkDays || 26;

  const dailyRate = monthlySalary / workDaysPerMonth;
  const baseSalary = monthlySalary;

  const totalMealAllowance = mealAllowancePerDay * daysAttended;

  const totalIncome = baseSalary + monthlyAllowance + totalMealAllowance + totalOTAmount;
  const totalDeduction = totalLateFine + totalLeaveDeduction;
  const netAmount = totalIncome - totalDeduction;

  return {
    baseSalary,
    monthlyAllowance,
    totalMealAllowance,
    totalOTAmount,
    totalIncome,
    totalLateFine,
    totalLeaveDeduction,
    totalDeduction,
    netAmount: Math.max(0, netAmount),
    details: {
      dailyRate,
      daysAttended,
      workDaysPerMonth
    }
  };
}

/**
 * คำนวณเงินรายวันจากข้อมูล Attendance
 */
export function calculateAttendanceWage(attendance, employee, position, configs, calculatedWorkDays) {
  const lateMinutes = calculateLateMinutes(
    attendance.check_in_time,
    employee.work_start_time || configs.standard_check_in_time || '08:00:00'
  );

  if (employee.employment_type === 'daily') {
    const result = calculateDailyWage({
      dailyWage: parseFloat(employee.base_salary_or_wage),
      mealAllowance: parseFloat(position.meal_allowance_per_day || 0),
      otHours: parseFloat(attendance.ot_hours || 0),
      lateMinutes: lateMinutes,
      isLeave: attendance.is_leave,
      leaveType: attendance.leave_type
    }, configs);

    return result.netAmount;
  }

  // สำหรับ monthly ใช้ตัวหารไดนามิก
  const workDaysPerMonth = calculatedWorkDays || 26;
  const dailyRate = parseFloat(employee.base_salary_or_wage) / workDaysPerMonth;
  const mealAllowance = parseFloat(position.meal_allowance_per_day || 0);

  const hourlyRate = dailyRate / parseFloat(configs.daily_work_hours || 8);

  const otAmount = calculateOT(
    parseFloat(attendance.ot_hours || 0),
    hourlyRate,
    parseFloat(configs.ot_rate_multiplier || 1.5)
  );

  const lateFine = calculateLateFine(
    lateMinutes,
    parseFloat(configs.late_fine_per_minute || 2.0)
  );

  const leaveDeduction = calculateLeaveDeduction(
    attendance.is_leave,
    attendance.leave_type,
    dailyRate + mealAllowance,
    configs
  );

  const netAmount = dailyRate + mealAllowance + otAmount - lateFine - leaveDeduction;

  return Math.max(0, netAmount);
}

export default {
  calculateLateMinutes,
  calculateLateFine,
  calculateOT,
  calculateHourlyRate,
  calculateHourlyRateFromSalary,
  calculateLeaveDeduction,
  calculateDailyWage,
  calculateMonthlySalary,
  calculateAttendanceWage,
  calculateWorkDaysInMonth
};
