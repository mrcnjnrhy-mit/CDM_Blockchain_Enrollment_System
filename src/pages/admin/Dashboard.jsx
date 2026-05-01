import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/admin/create-user" className="bg-white p-6 rounded-xl shadow hover:shadow-md">
            <h3 className="font-semibold">Create User</h3>
            <p className="text-sm text-gray-500">Create registrar, cashier, or admin accounts</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
