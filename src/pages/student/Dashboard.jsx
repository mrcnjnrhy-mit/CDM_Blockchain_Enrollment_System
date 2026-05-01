import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ModuleBackButton from '../../components/ModuleBackButton';
import AlreadyEnrolledModal from '../../components/AlreadyEnrolledModal';
import API from '../../api/axios';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [showAlreadyEnrolledModal, setShowAlreadyEnrolledModal] = useState(false);
  const [currentSemesterEnrollment, setCurrentSemesterEnrollment] = useState(null);

  // Current academic year and semester (should match EnrollmentForm.jsx)
  const CURRENT_ACADEMIC_YEAR = '2026 - 2027';
  const CURRENT_SEMESTER = '1st Semester';

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const { data } = await API.get('/students/me/enrollments');
        const enrollmentsList = data.enrollments || [];
        setEnrollments(enrollmentsList);

        // Check if already enrolled in current semester (not rejected)
        const currentSemesterEnroll = enrollmentsList.find(
          (e) => e.academicYear === CURRENT_ACADEMIC_YEAR &&
                 e.semester === CURRENT_SEMESTER &&
                 e.status !== 'rejected'
        );
        setCurrentSemesterEnrollment(currentSemesterEnroll || null);
      } catch (err) {
        console.error('Failed to fetch enrollments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
    
    // Refresh enrollments every 10 seconds to catch status updates from registrar
    const interval = setInterval(fetchEnrollments, 10000);
    return () => clearInterval(interval);
  }, []);

  const pendingEnrollment = enrollments.find((enrollment) => enrollment.status === 'pending');
  const latestEnrollment = enrollments[0] || null;
  const totalUnits = pendingEnrollment?.totalUnits || latestEnrollment?.totalUnits || 0;
  const subjectCount = pendingEnrollment?.subjects?.length || latestEnrollment?.subjects?.length || 0;
  const outstandingBalance = latestEnrollment?.assessedFees?.outstandingBalance ?? 0;
  const statusLabel = latestEnrollment?.status === 'approved' ? 'Enrolled' : latestEnrollment?.status;

  const handleEnrollClick = () => {
    if (currentSemesterEnrollment) {
      setShowAlreadyEnrolledModal(true);
    } else {
      navigate('/student/enroll');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <ModuleBackButton />
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Welcome, {user?.name}! 👋
        </h2>
        <p className="text-gray-500 mb-6">Student Dashboard</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-xl font-bold text-blue-600">
              {loading ? 'Loading...' : (statusLabel?.charAt(0).toUpperCase() + statusLabel?.slice(1)) || 'No enrollment'}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Enrolled Subjects</p>
            <p className="text-xl font-bold text-green-600">{loading ? '...' : subjectCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">Total Units</p>
            <p className="text-xl font-bold text-yellow-600">{loading ? '...' : totalUnits}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500">
            <p className="text-sm text-gray-500">Outstanding Balance</p>
            <p className="text-xl font-bold text-red-600">
              {loading ? '...' : `₱${outstandingBalance.toLocaleString()}`}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          {loading ? (
            <p className="text-sm text-gray-500">Loading enrollment information...</p>
          ) : latestEnrollment ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Enrollment Information</h3>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  latestEnrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  latestEnrollment.status === 'approved' ? 'bg-green-100 text-green-700' :
                  latestEnrollment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {latestEnrollment.status === 'approved'
                    ? 'Enrolled'
                    : latestEnrollment.status.charAt(0).toUpperCase() + latestEnrollment.status.slice(1)}
                </span>
              </div>
              
              {latestEnrollment.status === 'pending' && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">⏳ Your enrollment is being reviewed. The registrar will approve or request additional information.</p>
                </div>
              )}
              
              {latestEnrollment.status === 'approved' && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">✅ Your enrollment has been approved! Proceed to payment.</p>
                </div>
              )}
              
              {latestEnrollment.status === 'rejected' && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">❌ Your enrollment was rejected. Please check remarks or contact the registrar office.</p>
                </div>
              )}
              
              {latestEnrollment.status === 'paid' && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">💳 Payment received. Your enrollment is complete!</p>
                </div>
              )}
              
              <div className="space-y-3 text-sm text-gray-700">
                <p><span className="font-semibold">Semester:</span> {latestEnrollment.semester}</p>
                <p><span className="font-semibold">Academic Year:</span> {latestEnrollment.academicYear}</p>
                <p><span className="font-semibold">Program:</span> {latestEnrollment.applicationData?.program || latestEnrollment.applicationData?.course || 'N/A'}</p>
                <p><span className="font-semibold">Year Level:</span> {latestEnrollment.applicationData?.yearLevel || 'N/A'}</p>
                <p><span className="font-semibold">Total Fee:</span> ₱{latestEnrollment.totalFee}</p>
                <p><span className="font-semibold">Outstanding Balance:</span> ₱{outstandingBalance.toLocaleString()}</p>
                <p><span className="font-semibold">Photo Status:</span> {latestEnrollment.studentPhoto ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                {latestEnrollment.studentPhoto && (
                  <img
                    src={latestEnrollment.studentPhoto}
                    alt="Your 2x2 ID Photo"
                    className="mt-3 h-32 w-32 rounded-lg border border-gray-200 object-cover"
                  />
                )}
                {latestEnrollment.remarks && (
                  <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold mb-1">💬 Registrar Remarks:</p>
                    <p className="text-sm text-blue-900">{latestEnrollment.remarks}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">You do not have any enrollment yet. Click "Enroll Now" to get started.</p>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={handleEnrollClick}
            disabled={currentSemesterEnrollment ? true : false}
            className={`px-6 py-3 rounded-lg font-semibold ${
              currentSemesterEnrollment
                ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {currentSemesterEnrollment ? '✓ Already Enrolled' : '📝 Enroll Now'}
          </button>
        </div>
      </div>

      {/* Already Enrolled Modal */}
      <AlreadyEnrolledModal
        isOpen={showAlreadyEnrolledModal}
        enrollmentData={currentSemesterEnrollment}
        onClose={() => setShowAlreadyEnrolledModal(false)}
      />
    </div>
  );
}