import { useNavigate } from 'react-router-dom';

export default function AlreadyEnrolledModal({ isOpen, enrollmentData, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleViewDetails = () => {
    navigate('/student/dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 flex justify-between items-center rounded-t-xl border-b-4 border-orange-800">
            <div>
              <h2 className="text-2xl font-bold">⚠️ Already Enrolled</h2>
            </div>
            <button
              onClick={onClose}
              className="text-2xl hover:bg-white hover:bg-opacity-20 p-1 rounded transition"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-gray-800 font-semibold text-center">
              You are already enrolled in the current semester
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Academic Year:</span> {enrollmentData?.academicYear}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <span className="font-semibold">Semester:</span> {enrollmentData?.semester}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <span className="font-semibold">Status:</span>{' '}
                <span className={`font-semibold ${
                  enrollmentData?.status === 'pending' ? 'text-yellow-700' :
                  enrollmentData?.status === 'approved' ? 'text-green-700' :
                  enrollmentData?.status === 'rejected' ? 'text-red-700' :
                  'text-blue-700'
                }`}>
                  {enrollmentData?.status?.charAt(0).toUpperCase() + enrollmentData?.status?.slice(1)}
                </span>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                You cannot submit another enrollment form for the same semester. If you need to modify your enrollment, please contact the registrar office.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t p-4 flex gap-3 rounded-b-xl">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 font-semibold transition"
            >
              Close
            </button>
            <button
              onClick={handleViewDetails}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              View My Enrollment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
