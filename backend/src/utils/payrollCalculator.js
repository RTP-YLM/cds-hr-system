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
 * คำนวณอัตราต่อชั่วโมง สำหรับพนักงานรายเดือน
 * @param {number} monthlySalary - เงินเดือนรายเดือน
 * @param {number} workDaysPerMonth - จำนวนวันทำงานต่อเดือน
 * @param {number} workHoursPerDay - จำนวนชั่วโมงทำงานต่อวัน
 * @returns {number} อัตราต่อชั่วโมง
 */
export function calculateHourlyRateFromSalary(monthlySalary, workDaysPerMonth = 26, workHoursPerDay = 8) {
  const dailyRate = monthlySalary / workDaysPerMonth;
  return dailyRate / workHoursPerDay;
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
 *
 * @param {object} params - พารามิเตอร์
 * @param {number} params.dailyWage - ค่าแรงรายวัน
 * @param {number} params.mealAllowance - ค่าอาหาร
 * @param {number} params.otHours - ชั่วโมง OT
 * @param {number} params.lateMinutes - นาทีที่สาย
 * @param {boolean} params.isLeave - ลาหรือไม่
 * @param {string} params.leaveType - ประเภทการลา
 * @param {object} configs - การตั้งค่าระบบ
 * @returns {object} ผลการคำนวณ
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

  // คำนวณอัตราต่อชั่วโมง
  const hourlyRate = calculateHourlyRate(
    dailyWage,
    parseFloat(configs.daily_work_hours || 8)
  );

  // คำนวณ OT
  const otAmount = calculateOT(
    otHours,
    hourlyRate,
    parseFloat(configs.ot_rate_multiplier || 1.5)
  );

  // คำนวณค่าปรับสาย
  const lateFine = calculateLateFine(
    lateMinutes,
    parseFloat(configs.late_fine_per_minute || 2.0)
  );

  // คำนวณรายได้พื้นฐาน
  let baseAmount = dailyWage;

  // ถ้าลางาน ให้คำนวณการหัก
  const leaveDeduction = calculateLeaveDeduction(
    isLeave,
    leaveType,
    dailyWage + mealAllowance,
    configs
  );

  // คำนวณยอดรวม
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
    netAmount: Math.max(0, netAmount), // ไม่ให้ติดลบ
    details: {
      hourlyRate,
      otHours,
      lateMinutes
    }
  };
}

/**
 * คำนวณรายได้รายเดือน (Monthly Salary Calculation)
 * สำหรับพนักงานรายเดือน
 *
 * @param {object} params - พารามิเตอร์
 * @param {number} params.monthlySalary - เงินเดือนรายเดือน
 * @param {number} params.monthlyAllowance - เบี้ยเลี้ยงรายเดือน
 * @param {number} params.daysAttended - จำนวนวันที่เข้างาน (ไม่ลา)
 * @param {number} params.mealAllowancePerDay - ค่าอาหารต่อวัน
 * @param {number} params.totalOTAmount - เงิน OT รวมทั้งเดือน
 * @param {number} params.totalLateFine - ค่าปรับสายรวมทั้งเดือน
 * @param {number} params.totalLeaveDeduction - การหักลารวมทั้งเดือน
 * @param {object} configs - การตั้งค่าระบบ
 * @returns {object} ผลการคำนวณ
 */
export function calculateMonthlySalary(params, configs) {
  const {
    monthlySalary,
    monthlyAllowance = 0,
    daysAttended = 0,
    mealAllowancePerDay = 0,
    totalOTAmount = 0,
    totalLateFine = 0,
    totalLeaveDeduction = 0
  } = params;

  const workDaysPerMonth = parseFloat(configs.work_days_per_month || 26);

  // คำนวณเงินเดือนตามสัดส่วนวันที่เข้างาน
  const dailyRate = monthlySalary / workDaysPerMonth;
  const baseSalary = monthlySalary; // เงินเดือนเต็ม

  // คำนวณค่าอาหารตามจำนวนวันที่เข้างาน
  const totalMealAllowance = mealAllowancePerDay * daysAttended;

  // คำนวณยอดรวม
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
    netAmount: Math.max(0, netAmount), // ไม่ให้ติดลบ
    details: {
      dailyRate,
      daysAttended,
      workDaysPerMonth
    }
  };
}

/**
 * คำนวณเงินรายวันจากข้อมูล Attendance
 * @param {object} attendance - ข้อมูล attendance
 * @param {object} employee - ข้อมูลพนักงาน
 * @param {object} position - ข้อมูลตำแหน่ง
 * @param {object} configs - การตั้งค่าระบบ
 * @returns {number} ยอดเงินที่คำนวณได้
 */
export function calculateAttendanceWage(attendance, employee, position, configs) {
  const lateMinutes = calculateLateMinutes(
    attendance.check_in_time,
    configs.standard_check_in_time || '08:00:00'
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

  // สำหรับ monthly แยกคำนวณเป็นรายวัน แล้วรวมทั้งเดือนทีหลัง
  const workDaysPerMonth = parseFloat(configs.work_days_per_month || 26);
  const dailyRate = parseFloat(employee.base_salary_or_wage) / workDaysPerMonth;
  const mealAllowance = parseFloat(position.meal_allowance_per_day || 0);

  const hourlyRate = calculateHourlyRateFromSalary(
    parseFloat(employee.base_salary_or_wage),
    workDaysPerMonth,
    parseFloat(configs.daily_work_hours || 8)
  );

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
  calculateAttendanceWage
};
