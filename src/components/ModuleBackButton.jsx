import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ModuleBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getHomePath = () => {
    if (!user) return '/login';
    if (user.role === 'student') return '/student/dashboard';
    if (user.role === 'registrar') return '/registrar';
    if (user.role === 'cashier') return '/cashier';
    if (user.role === 'admin') return '/admin';
    return '/login';
  };

  const getBackPath = () => {
    if (location.pathname === '/student/enroll') return '/student/dashboard';
    if (location.pathname === '/student/subjects') return '/student/dashboard';
    if (location.pathname === '/student/grades') return '/student/dashboard';
    if (location.pathname === '/student/evaluation') return '/student/dashboard';
    if (location.pathname === '/registrar/audit') return '/registrar';
    if (location.pathname === '/registrar/courses') return '/registrar';
    if (location.pathname === '/admin/create-user') return '/admin';
    if (location.pathname === '/profile') return getHomePath();
    return null;
  };

  const backPath = getBackPath();

  if (!backPath) return null;

  return (
    <button
      type="button"
      onClick={() => navigate(backPath)}
      className="mb-4 inline-flex items-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
    >
      ← Back
    </button>
  );
}