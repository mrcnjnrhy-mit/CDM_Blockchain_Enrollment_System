import Navbar from '../../components/Navbar';

export default function CashierDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Cashier Dashboard</h2>
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
          Payment management coming soon.
        </div>
      </div>
    </div>
  );
}