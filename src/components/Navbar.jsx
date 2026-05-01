import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getHomePath = () => {
    if (!user) return '/login';
    if (user.role === 'student') return '/student/dashboard';
    if (user.role === 'registrar') return '/registrar';
    if (user.role === 'cashier') return '/cashier';
    if (user.role === 'admin') return '/admin';
    return '/login';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col bg-blue-700 text-white shadow-xl md:w-64">
      <div className="border-b border-white/10 p-5">
        <Link to={getHomePath()} className="block text-lg font-bold leading-tight">
          Colegio de Marinduque
        </Link>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/70">
          {user?.role || 'Guest'}
        </p>
      </div>
      <div className="flex-1 p-4">
        <div className="space-y-2">
          {user?.role === 'student' && (
            <>
              <Link
                to="/student/dashboard"
                className="block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Student Dashboard
              </Link>
              <Link
                to="/student/subjects"
                className="block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Enrolled Subjects
              </Link>
              <Link
                to="/student/grades"
                className="block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Grades
              </Link>
              <Link
                to="/student/evaluation"
                className="block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Evaluation
              </Link>
              <Link
                to="/student/reports"
                className="block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Certificate of Registration
              </Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Admin Dashboard
            </Link>
          )}
          {user?.role === 'registrar' && (
            <>
              <Link
                to="/registrar"
                className="block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Registrar Dashboard
              </Link>
              <Link
                to="/registrar/subjects"
                className="block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Subjects
              </Link>
              <Link
                to="/registrar/enrollees"
                className="block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Enrollees
              </Link>
              <Link
                to="/registrar/courses"
                className="block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Courses
              </Link>
              <Link
                to="/registrar/audit"
                className="block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Blockchain Audit
              </Link>
              <Link
                to="/registrar/reports"
                className="block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Student Reports
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 text-sm text-white/85">
          <Link
            to="/profile"
            className="block font-semibold leading-tight text-white transition hover:text-blue-100"
          >
            {user?.name || 'Guest'}
          </Link>
          <p className="text-xs text-white/60">{user?.email || 'Not signed in'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}