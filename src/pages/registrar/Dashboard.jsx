import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import EnrollmentDetailModal from './EnrollmentDetailModal';

export default function RegistrarDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [summary, setSummary] = useState({ counts: { total: 0, pending: 0, approved: 0, paid: 0, dropped: 0, rejected: 0 } });
  const [series, setSeries] = useState([]);
  const [dropSeries, setDropSeries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchEnrollments = async () => {
    try {
      const { data } = await API.get('/enrollment');
      setEnrollments(data);
    } catch {
      toast.error('Failed to load enrollments');
    }
  };

  const fetchSummary = async () => {
    try {
      const { data } = await API.get('/reports/enrollees-summary');
      setSummary(data || { counts: {} });
    } catch {
      // non-fatal
    }
  };

  const fetchSeries = async () => {
    try {
      const { data } = await API.get('/reports/enrollees-timeseries');
      setSeries(data.series || []);
    } catch {
      // non-fatal
    }
  };

  const fetchDropSeries = async () => {
    try {
      const { data } = await API.get('/reports/drop-rate-timeseries');
      setDropSeries(data.series || []);
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([
        fetchEnrollments(),
        fetchSummary(),
        fetchSeries(),
        fetchDropSeries(),
      ]);
    })();
  }, []);

  const filteredEnrollments = enrollments.filter(e => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();

    try {
      const serialized = JSON.stringify(e).toLowerCase();
      if (serialized.includes(q)) return true;
    } catch {
      // ignore serialization failures and fall back to field checks
    }

    const student = e.student || {};
    const userName = (student.user?.name) || '';
    const name = (userName || `${student.firstName || ''} ${student.lastName || ''}`).toLowerCase();
    const sid = (student.studentId || '').toLowerCase();
    const program = (
      (e.applicationData?.program) ||
      (e.applicationData?.course) ||
      (student.course) ||
      ''
    ).toLowerCase();
    const sem = (`${e.semester || ''} ${e.academicYear || ''}`).toLowerCase();
    return (
      name.includes(q) ||
      sid.includes(q) ||
      program.includes(q) ||
      sem.includes(q)
    );
  });

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/enrollment/${id}/status`, { status });
      toast.success(`Enrollment ${status}`);
      fetchEnrollments();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleViewDetails = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsDetailOpen(true);
  };

  const statusColor = {
    pending:  'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    paid:     'bg-blue-100 text-blue-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Registrar Dashboard</h2>
          <div className="w-80 relative">
            <label className="relative block">
              <span className="sr-only">Search enrollees</span>
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-3 pr-10 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                placeholder="Search by name, student no., program, semester..."
                type="text"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </label>
          </div>
        </div>
        {/* Summary counters + chart */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start gap-2">
            <p className="text-sm text-gray-500">Total Enrollees</p>
            <p className="text-2xl font-bold">{summary.counts?.total ?? 0}</p>
            <p className="text-xs text-gray-400">Across all semesters</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start gap-2">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{summary.counts?.pending ?? 0}</p>
            <p className="text-xs text-gray-400">Awaiting review</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start gap-2">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-green-600">{summary.counts?.approved ?? 0}</p>
            <p className="text-xs text-gray-400">Ready for payment</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start gap-2">
            <p className="text-sm text-gray-500">Dropped</p>
            <p className="text-2xl font-bold text-red-600">{summary.counts?.dropped ?? 0}</p>
            <p className="text-xs text-gray-400">Removed from active status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Enrollees (last 12 months)</h3>
              <span className="text-xs text-gray-400">Count</span>
            </div>
            <div className="h-56">
              <Line
                options={{ responsive: true, maintainAspectRatio: false }}
                data={{
                  labels: series.map(s => s.label),
                  datasets: [
                    {
                      label: 'Enrollees',
                      data: series.map(s => s.count),
                      fill: false,
                      borderColor: '#3b82f6',
                      backgroundColor: '#3b82f6',
                      tension: 0.35,
                    }
                  ]
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Student Drop Rate (last 12 months)</h3>
              <span className="text-xs text-gray-400">%</span>
            </div>
            <div className="h-56">
            <Line
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    min: 0,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`,
                    },
                  },
                },
              }}
              data={{
                labels: dropSeries.map(s => s.label),
                datasets: [
                  {
                    label: 'Drop Rate %',
                    data: dropSeries.map(s => s.dropRate),
                    fill: false,
                    borderColor: '#ef4444',
                    backgroundColor: '#ef4444',
                    tension: 0.35,
                  }
                ]
              }}
            />
            </div>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow">
            No enrollments yet.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEnrollments.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow">No results for your search.</div>
            ) : (
              filteredEnrollments.map(e => (
                <div key={e._id} className="bg-white rounded-xl shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">
                        {e.student?.user?.name || `${e.student?.firstName || ''} ${e.student?.lastName || ''}` || 'Unknown Student'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {e.student?.studentId} • {e.semester} {e.academicYear}
                      </p>
                      <p className="text-sm text-gray-500">
                        {e.subjects?.length} subjects • {e.totalUnits} units • ₱{e.totalFee}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        Hash: {e.blockchainHash?.slice(0, 24)}...
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColor[e.status]}`}>
                      {e.status}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleViewDetails(e)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex-1"
                    >
                       View Details
                    </button>
                    {e.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(e._id, 'approved')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => updateStatus(e._id, 'rejected')}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Enrollment Detail Modal */}
      <EnrollmentDetailModal
        enrollment={selectedEnrollment}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdate={fetchEnrollments}
      />
    </div>
  );
}