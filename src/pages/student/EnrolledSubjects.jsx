import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import ModuleBackButton from '../../components/ModuleBackButton';
import API from '../../api/axios';

export default function StudentEnrolledSubjects() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/students/me/enrollments')
      .then(({ data }) => setEnrollments(data.enrollments || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="mx-auto max-w-5xl p-6">
        <ModuleBackButton />
        <h2 className="mb-2 text-2xl font-bold text-gray-800">Enrolled Subjects</h2>
        <p className="mb-6 text-sm text-gray-500">View all subjects submitted through your enrollment records.</p>

        {loading ? (
          <div className="rounded-xl bg-white p-6 shadow">Loading enrolled subjects...</div>
        ) : enrollments.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow">
            You have no enrolled subjects yet.
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment._id} className="rounded-xl bg-white p-5 shadow">
                <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {enrollment.semester} • {enrollment.academicYear}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Status: <span className="font-semibold capitalize text-gray-700">{enrollment.status}</span>
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Total Units: <span className="font-semibold text-gray-700">{enrollment.totalUnits || 0}</span></p>
                    <p>Fee: <span className="font-semibold text-gray-700">₱{enrollment.totalFee || 0}</span></p>
                  </div>
                </div>

                {enrollment.subjects?.length ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {enrollment.subjects.map((subject) => (
                      <div key={subject._id} className="rounded-lg border border-gray-200 p-4">
                        <p className="font-semibold text-gray-800">{subject.code} - {subject.name}</p>
                        <p className="text-sm text-gray-500">{subject.schedule || 'No schedule listed'}</p>
                        <p className="text-sm text-gray-500">Instructor: {subject.instructor || 'TBA'}</p>
                        <p className="text-sm text-blue-600">{subject.units} units</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No subjects found for this enrollment.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}