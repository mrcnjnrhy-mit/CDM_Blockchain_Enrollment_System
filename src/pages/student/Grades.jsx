import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import ModuleBackButton from '../../components/ModuleBackButton';
import API from '../../api/axios';

export default function StudentGrades() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/students/me/enrollments')
      .then(({ data }) => setEnrollments(data.enrollments || []))
      .finally(() => setLoading(false));
  }, []);

  const gradeRows = enrollments.flatMap((enrollment) =>
    (enrollment.subjects || []).map((subject) => ({
      key: `${enrollment._id}-${subject._id}`,
      semester: enrollment.semester,
      academicYear: enrollment.academicYear,
      subject,
      grade: subject.grade || 'Pending',
    }))
  );

  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="mx-auto max-w-5xl p-6">
        <ModuleBackButton />
        <h2 className="mb-2 text-2xl font-bold text-gray-800">Grades</h2>
        <p className="mb-6 text-sm text-gray-500">Grades will appear here once they are posted by the registrar.</p>

        {loading ? (
          <div className="rounded-xl bg-white p-6 shadow">Loading grades...</div>
        ) : gradeRows.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow">
            No grades available yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Semester</th>
                  <th className="px-4 py-3 font-semibold">Academic Year</th>
                  <th className="px-4 py-3 font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gradeRows.map((row) => (
                  <tr key={row.key}>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {row.subject.code} - {row.subject.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.semester}</td>
                    <td className="px-4 py-3 text-gray-600">{row.academicYear}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{row.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}