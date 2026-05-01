import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login              from './pages/Login';
import Register           from './pages/Register';
import NotFound           from './pages/NotFound';
import StudentDashboard   from './pages/student/Dashboard';
import EnrollmentForm     from './pages/student/EnrollmentForm';
import StudentEnrolledSubjects from './pages/student/EnrolledSubjects';
import StudentGrades from './pages/student/Grades';
import StudentEvaluation from './pages/student/Evaluation';
import StudentReports from './pages/student/Reports';
import RegistrarDashboard from './pages/registrar/Dashboard';
import RegistrarBlockchainAudit from './pages/registrar/BlockchainAudit';
import RegistrarSubjects from './pages/registrar/Subjects';
import RegistrarCourses from './pages/registrar/Courses';
import RegistrarReports from './pages/registrar/Reports';
import RegistrarEnrollees from './pages/registrar/Enrollees';
import CashierDashboard   from './pages/cashier/Dashboard';
import CreateUser         from './pages/admin/CreateUser';
import AdminDashboard     from './pages/admin/Dashboard';
import Profile            from './pages/Profile';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  const homeRedirect = () => {
    if (!user) return '/login';
    if (user.role === 'student')   return '/student/dashboard';
    if (user.role === 'registrar') return '/registrar';
    if (user.role === 'cashier')   return '/cashier';
    return '/admin';
  };

  return (
    <Routes>
      <Route path="/"        element={<Navigate to={homeRedirect()} />} />
      <Route path="/login"   element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/student/dashboard" element={
        <ProtectedRoute roles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student/enroll" element={
        <ProtectedRoute roles={['student']}>
          <EnrollmentForm />
        </ProtectedRoute>
      } />
      <Route path="/student/subjects" element={
        <ProtectedRoute roles={['student']}>
          <StudentEnrolledSubjects />
        </ProtectedRoute>
      } />
      <Route path="/student/grades" element={
        <ProtectedRoute roles={['student']}>
          <StudentGrades />
        </ProtectedRoute>
      } />
      <Route path="/student/evaluation" element={
        <ProtectedRoute roles={['student']}>
          <StudentEvaluation />
        </ProtectedRoute>
      } />
      <Route path="/student/reports" element={
        <ProtectedRoute roles={['student']}>
          <StudentReports />
        </ProtectedRoute>
      } />
      <Route path="/registrar" element={
        <ProtectedRoute roles={['registrar']}>
          <RegistrarDashboard />
        </ProtectedRoute>
      } />
      <Route path="/registrar/audit" element={
        <ProtectedRoute roles={['registrar']}>
          <RegistrarBlockchainAudit />
        </ProtectedRoute>
      } />
      <Route path="/registrar/subjects" element={
        <ProtectedRoute roles={['registrar']}>
          <RegistrarSubjects />
        </ProtectedRoute>
      } />
      <Route path="/registrar/enrollees" element={
        <ProtectedRoute roles={['registrar']}>
          <RegistrarEnrollees />
        </ProtectedRoute>
      } />
      <Route path="/registrar/courses" element={
        <ProtectedRoute roles={['registrar']}>
          <RegistrarCourses />
        </ProtectedRoute>
      } />
      <Route path="/registrar/reports" element={
        <ProtectedRoute roles={['registrar']}>
          <RegistrarReports />
        </ProtectedRoute>
      } />
      <Route path="/cashier" element={
        <ProtectedRoute roles={['cashier']}>
          <CashierDashboard />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute roles={['student', 'registrar', 'cashier', 'admin']}>
          <Profile />
        </ProtectedRoute>
      } />
        <Route path="/admin/create-user" element={
          <ProtectedRoute roles={['admin']}>
            <CreateUser />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}