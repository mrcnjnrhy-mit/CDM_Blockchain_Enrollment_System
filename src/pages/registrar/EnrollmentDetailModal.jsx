import { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function EnrollmentDetailModal({ enrollment, isOpen, onClose, onUpdate }) {
  const [remarks, setRemarks] = useState(enrollment?.remarks || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !enrollment) return null;

  const appData = enrollment.applicationData || {};
  const student = enrollment.student || {};
  const user = student.user || {};

  const handleSaveRemarks = async () => {
    try {
      setIsSaving(true);
      const { data } = await API.patch(`/enrollment/${enrollment._id}/remarks`, { remarks });
      toast.success('Remarks saved successfully');
      setRemarks(data.remarks);
      onUpdate?.();
    } catch (err) {
      toast.error('Failed to save remarks');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    paid: 'bg-blue-100 text-blue-700',
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
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center border-b">
            <div>
              <h2 className="text-2xl font-bold">Enrollment Details</h2>
              <p className="text-blue-100 text-sm mt-1">ID: {enrollment._id}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColor[enrollment.status]}`}>
                {enrollment.status}
              </span>
              <button
                onClick={onClose}
                className="text-2xl hover:bg-white hover:bg-opacity-20 p-1 rounded transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Student Photo */}
            {enrollment.studentPhoto && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3">2x2 ID Photo</p>
                <img
                  src={enrollment.studentPhoto}
                  alt="Student 2x2 Photo"
                  className="w-32 h-40 object-cover rounded-lg border border-gray-300 shadow"
                />
              </div>
            )}

            {/* School Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-blue-600">
                📚 School Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Academic Year</p>
                  <p className="text-gray-800 font-medium">{appData.academicYear}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Semester</p>
                  <p className="text-gray-800 font-medium">{appData.semester}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Year Level</p>
                  <p className="text-gray-800 font-medium">{appData.yearLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Program</p>
                  <p className="text-gray-800 font-medium">{appData.program || appData.course}</p>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-blue-600">
                👤 Student Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Name</p>
                  <p className="text-gray-800 font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                  <p className="text-gray-800 font-medium text-sm">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Gender</p>
                  <p className="text-gray-800 font-medium">{appData.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Birthdate</p>
                  <p className="text-gray-800 font-medium">
                    {appData.birthdate ? new Date(appData.birthdate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Age</p>
                  <p className="text-gray-800 font-medium">{appData.age || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Contact</p>
                  <p className="text-gray-800 font-medium">{appData.contactNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Address</p>
                <p className="text-gray-800">{appData.address || 'N/A'}</p>
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-blue-600">
                👨‍👩‍👧 Parent/Guardian Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Father</p>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm"><span className="font-semibold">Name:</span> {appData.fatherName || 'N/A'}</p>
                    <p className="text-sm"><span className="font-semibold">Occupation:</span> {appData.fatherOccupation || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Mother</p>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm"><span className="font-semibold">Name:</span> {appData.motherName || 'N/A'}</p>
                    <p className="text-sm"><span className="font-semibold">Occupation:</span> {appData.motherOccupation || 'N/A'}</p>
                  </div>
                </div>
              </div>
              {appData.guardianName && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Guardian (if applicable)</p>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm"><span className="font-semibold">Name:</span> {appData.guardianName}</p>
                    <p className="text-sm"><span className="font-semibold">Relationship:</span> {appData.guardianRelationship || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-blue-600">
                🏥 Medical Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Special Needs</p>
                  <p className="text-gray-800">{appData.specialNeeds || 'None'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Medical Condition</p>
                  <p className="text-gray-800">{appData.medicalCondition || 'None'}</p>
                </div>
              </div>
            </div>

            {/* Student Status */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-blue-600">
                📋 Student Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">New/Returning</p>
                  <p className="text-gray-800">{appData.isReturning ? 'Returning Student' : 'New Student'}</p>
                </div>
                {appData.isTransferee && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Previous School</p>
                    <p className="text-gray-800">{appData.previousSchool || 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Enrolled Subjects */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-blue-600">
                📖 Enrolled Subjects ({enrollment.subjects?.length || 0})
              </h3>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-200 border-b">
                      <th className="text-left p-3 font-semibold">Subject Code</th>
                      <th className="text-left p-3 font-semibold">Subject Name</th>
                      <th className="text-center p-3 font-semibold">Units</th>
                      <th className="text-right p-3 font-semibold">Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollment.subjects && enrollment.subjects.length > 0 ? (
                      enrollment.subjects.map(subject => (
                        <tr key={subject._id} className="border-b hover:bg-gray-100">
                          <td className="p-3 font-mono">{subject.code}</td>
                          <td className="p-3">{subject.name}</td>
                          <td className="text-center p-3">{subject.units}</td>
                          <td className="text-right p-3">₱{subject.units * 500}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-3 text-center text-gray-500">No subjects enrolled</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-right bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm"><span className="font-semibold">Total Units:</span> {enrollment.totalUnits}</p>
                <p className="text-sm"><span className="font-semibold">Total Fee:</span> ₱{enrollment.totalFee}</p>
              </div>
            </div>

            {/* Blockchain Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-blue-600">
                🔐 Blockchain Audit
              </h3>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                <p>Hash: <span className="break-all">{enrollment.blockchainHash}</span></p>
              </div>
            </div>

            {/* Remarks Section */}
            <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">💬 Remarks/Comments</h3>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Write your remarks or comments here. Let the student know if additional documents or clarifications are needed..."
                className="w-full h-32 p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSaveRemarks}
                  disabled={isSaving}
                  className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 font-semibold disabled:opacity-50 transition"
                >
                  {isSaving ? '💾 Saving...' : '💾 Save Remarks'}
                </button>
                {enrollment.remarksUpdatedAt && (
                  <div className="flex-1 bg-gray-100 p-2 rounded-lg text-xs text-gray-600 flex items-center justify-center">
                    Last updated: {new Date(enrollment.remarksUpdatedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 font-semibold transition"
              >
                Close
              </button>
              {enrollment.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      API.patch(`/enrollment/${enrollment._id}/status`, { status: 'approved' })
                        .then(() => {
                          toast.success('Enrollment approved');
                          onUpdate?.();
                          onClose();
                        })
                        .catch(() => toast.error('Failed to approve'));
                    }}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold transition"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => {
                      API.patch(`/enrollment/${enrollment._id}/status`, { status: 'rejected' })
                        .then(() => {
                          toast.success('Enrollment rejected');
                          onUpdate?.();
                          onClose();
                        })
                        .catch(() => toast.error('Failed to reject'));
                    }}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold transition"
                  >
                    ❌ Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
