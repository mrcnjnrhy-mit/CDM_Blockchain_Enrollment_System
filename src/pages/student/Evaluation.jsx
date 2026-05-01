import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import ModuleBackButton from '../../components/ModuleBackButton';
import API from '../../api/axios';

export default function StudentEvaluation() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/students/me/enrollments')
      .then(({ data }) => setEnrollments(data.enrollments || []))
      .finally(() => setLoading(false));
  }, []);

  const subjects = enrollments.flatMap((enrollment) => enrollment.subjects || []);

  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="mx-auto max-w-5xl p-6">
        <ModuleBackButton />
        <h2 className="mb-2 text-2xl font-bold text-gray-800">Evaluation</h2>
        <p className="mb-6 text-sm text-gray-500">Student evaluation module for instructors and subjects.</p>

        {loading ? (
          <div className="rounded-xl bg-white p-6 shadow">Loading evaluation items...</div>
        ) : subjects.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow">
            No evaluation items available yet.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 border border-amber-200">
              Evaluation submission is available as a module, but the scoring workflow is not yet enabled.
            </div>
            {subjects.map((subject) => (
              <div key={subject._id} className="rounded-xl bg-white p-5 shadow">
                <p className="font-semibold text-gray-800">{subject.code} - {subject.name}</p>
                <p className="text-sm text-gray-500">Instructor: {subject.instructor || 'TBA'}</p>
                <p className="text-sm text-gray-500">Schedule: {subject.schedule || 'No schedule listed'}</p>
                <button
                  type="button"
                  disabled
                  className="mt-4 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500"
                >
                  Evaluation Not Yet Open
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}