import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { EmployeesPage } from '@/pages/EmployeesPage'
import { EmployeeFormPage } from '@/pages/EmployeeFormPage'
import { AttendancePage } from '@/pages/AttendancePage'
import { PayrollPage } from '@/pages/PayrollPage'
import { SettingsPage } from '@/pages/SettingsPage'

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Main Layout Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Employee Routes */}
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/new" element={<EmployeeFormPage />} />
          <Route path="/employees/edit/:id" element={<EmployeeFormPage />} />

          {/* Attendance Route */}
          <Route path="/attendance" element={<AttendancePage />} />

          {/* Payroll Route */}
          <Route path="/payroll" element={<PayrollPage />} />

          {/* Settings Route */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
