import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import StudentInfoModal from './StudentInfoModal';
import DropStudentModal from './DropStudentModal';

export default function RegistrarEnrollees() {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [filterProgram, setFilterProgram] = useState('');
  const [filterAcademicYear, setFilterAcademicYear] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDropOpen, setIsDropOpen] = useState(false);
  const [isLoadingView, setIsLoadingView] = useState(false);

  const fetchStudents = async () => {
    try {
      const { data } = await API.get('/reports/students-list');
      const list = data.students || [];
      setStudents(list);
      const uniquePrograms = Array.from(new Set(list.map(s => s.program).filter(Boolean)));
      const uniqueAcademicYears = Array.from(new Set(list.map(s => s.academicYear).filter(Boolean)));
      setPrograms(uniquePrograms);
      setAcademicYears(uniqueAcademicYears);
    } catch {
      toast.error('Failed to load students');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        console.log('[DEBUG] Fetching students-list...');
        const { data } = await API.get('/reports/students-list');
        console.log('[DEBUG] Response from /reports/students-list:', data);
        const list = data.students || [];
        console.log(`[DEBUG] Got ${list.length} students`);
        setStudents(list);
        const uniquePrograms = Array.from(new Set(list.map(s => s.program).filter(Boolean)));
        const uniqueAcademicYears = Array.from(new Set(list.map(s => s.academicYear).filter(Boolean)));
        console.log('[DEBUG] Unique programs:', uniquePrograms);
        console.log('[DEBUG] Unique academic years:', uniqueAcademicYears);
        setPrograms(uniquePrograms);
        setAcademicYears(uniqueAcademicYears);
      } catch (err) {
        console.error('[ERROR] Failed to load students:', err.message);
        console.error('[ERROR] Full error:', err);
        if (err.response?.data) {
          console.error('[ERROR] Response data:', err.response.data);
        }
        toast.error('Failed to load students');
      }
    })();
  }, []);

  const filtered = students.filter(s => {
    const matchesProgram = !filterProgram || (s.program || '').toLowerCase() === filterProgram.toLowerCase();
    const matchesAcademicYear = !filterAcademicYear || (s.academicYear || '').toLowerCase() === filterAcademicYear.toLowerCase();
    return matchesProgram && matchesAcademicYear;
  });

  const handleViewStudent = async (student) => {
    try {
      setIsLoadingView(true);
      const { data } = await API.get(`/enrollment/${student.enrollmentId}`);
      setSelectedEnrollment(data);
      setIsInfoOpen(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load student information');
    } finally {
      setIsLoadingView(false);
    }
  };

  const handleOpenDrop = async (student) => {
    try {
      const { data } = await API.get(`/enrollment/${student.enrollmentId}`);
      setSelectedEnrollment(data);
      setIsDropOpen(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load student information');
    }
  };

  const studentLabel = (student) => student.studentId || student.studentDbId || 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Enrollees</h2>
          <div className="flex flex-wrap gap-2 items-center justify-end">
            <select
              value={filterProgram}
              onChange={e => setFilterProgram(e.target.value)}
              className="bg-white border rounded px-3 py-2"
            >
              <option value="">All programs</option>
              {programs.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={filterAcademicYear}
              onChange={e => setFilterAcademicYear(e.target.value)}
              className="bg-white border rounded px-3 py-2"
            >
              <option value="">All academic years</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <Link to="/registrar" className="text-sm text-blue-600">Back</Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          {filtered.length === 0 ? (
            <p className="text-gray-500">No enrollees found for the selected filters.</p>
          ) : (
            <ul className="space-y-2">
              {filtered.map(s => (
                <li key={s.enrollmentId} className="flex justify-between items-center border-b py-2">
                  <div>
                    <div className="font-semibold">{s.studentName}</div>
                    <div className="text-sm text-gray-500">{studentLabel(s)} • {s.program} • {s.semester} {s.academicYear}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${s.status === 'dropped' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {s.status}
                    </span>
                    <button
                      onClick={() => handleViewStudent(s)}
                      disabled={isLoadingView}
                      className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      View Student Info
                    </button>
                    <button
                      onClick={() => handleOpenDrop(s)}
                      disabled={s.status === 'dropped'}
                      className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                    >
                      {s.status === 'dropped' ? 'Dropped' : 'Drop Student'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <StudentInfoModal
        enrollment={selectedEnrollment}
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
      <DropStudentModal
        enrollment={selectedEnrollment}
        isOpen={isDropOpen}
        onClose={() => setIsDropOpen(false)}
        onDropped={fetchStudents}
      />
    </div>
  );
}
