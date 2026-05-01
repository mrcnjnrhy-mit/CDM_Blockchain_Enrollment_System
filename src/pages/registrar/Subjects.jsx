import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import ModuleBackButton from '../../components/ModuleBackButton';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const DEFAULT_PROGRAMS = [
  { code: 'BTVTED', name: 'Bachelor of Technical-Vocational Teacher Education' },
  { code: 'BSIS', name: 'Bachelor of Science in Information Systems' },
];

const yearLevels = [
  { label: '1st Year', value: 1 },
  { label: '2nd Year', value: 2 },
  { label: '3rd Year', value: 3 },
  { label: '4th Year', value: 4 },
];

const initialForm = {
  code: '',
  name: '',
  units: 3,
  schedule: '',
  instructor: '',
  maxSlots: 40,
  yearLevel: '1',
  program: '',
};

export default function RegistrarSubjects() {
  const [form, setForm] = useState(initialForm);
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState(DEFAULT_PROGRAMS);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadSubjects = async () => {
    try {
      const [subjectsResponse, programsResponse] = await Promise.allSettled([
        API.get('/subjects'),
        API.get('/courses'),
      ]);

      if (subjectsResponse.status === 'fulfilled') {
        setSubjects(subjectsResponse.value.data || []);
      }

      if (programsResponse.status === 'fulfilled' && programsResponse.value.data?.length) {
        setPrograms(programsResponse.value.data);
      } else {
        setPrograms(DEFAULT_PROGRAMS);
      }
    } catch {
      toast.error('Failed to load subjects');
    }
  };

  useEffect(() => {
    const initSubjects = async () => {
      await loadSubjects();
    };

    initSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/subjects', {
        ...form,
        units: Number(form.units),
        maxSlots: Number(form.maxSlots),
        yearLevel: Number(form.yearLevel),
        course: form.program,
        program: form.program,
      });
      toast.success('Subject added');
      setForm(initialForm);
      loadSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add subject');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (subject) => {
    setEditingId(subject._id);
    setEditForm({
      code: subject.code || '',
      name: subject.name || '',
      units: subject.units || 1,
      schedule: subject.schedule || '',
      instructor: subject.instructor || '',
      maxSlots: subject.maxSlots || 1,
      yearLevel: subject.yearLevel ? String(subject.yearLevel) : '',
      program: subject.program || subject.course || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(initialForm);
  };

  const saveEdit = async (id) => {
    setSavingEdit(true);
    try {
      await API.put(`/subjects/${id}`, {
        ...editForm,
        units: Number(editForm.units),
        maxSlots: Number(editForm.maxSlots),
        yearLevel: editForm.yearLevel ? Number(editForm.yearLevel) : undefined,
        course: editForm.program,
        program: editForm.program,
      });
      toast.success('Subject updated');
      cancelEdit();
      loadSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update subject');
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteSubject = async (id) => {
    const ok = window.confirm('Delete this subject? This action cannot be undone.');
    if (!ok) return;

    setDeletingId(id);
    try {
      await API.delete(`/subjects/${id}`);
      toast.success('Subject deleted');
      if (editingId === id) cancelEdit();
      loadSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete subject');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <ModuleBackButton />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Subject Management</h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            required
            placeholder="Subject Code (e.g. CS101)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="border px-3 py-2 rounded-lg"
          />
          <input
            required
            placeholder="Subject Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border px-3 py-2 rounded-lg"
          />
          <input
            type="number"
            min="1"
            required
            placeholder="Units"
            value={form.units}
            onChange={(e) => setForm({ ...form, units: e.target.value })}
            className="border px-3 py-2 rounded-lg"
          />
          <input
            type="number"
            min="1"
            required
            placeholder="Max Slots"
            value={form.maxSlots}
            onChange={(e) => setForm({ ...form, maxSlots: e.target.value })}
            className="border px-3 py-2 rounded-lg"
          />
          <select
            required
            value={form.yearLevel}
            onChange={(e) => setForm({ ...form, yearLevel: e.target.value })}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="">Select Year Level</option>
            {yearLevels.map((level) => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
          <select
            required
            value={form.program}
            onChange={(e) => setForm({ ...form, program: e.target.value })}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="">Select Program</option>
            {programs.map((program) => (
              <option key={program._id || program.code} value={program.code}>
                {program.code} - {program.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Schedule (optional)"
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            className="border px-3 py-2 rounded-lg"
          />
          <input
            placeholder="Instructor (optional)"
            value={form.instructor}
            onChange={(e) => setForm({ ...form, instructor: e.target.value })}
            className="border px-3 py-2 rounded-lg"
          />

          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Adding Subject...' : 'Add Subject'}
          </button>
        </form>

        <div className="space-y-3">
          {subjects.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-gray-400 shadow">No subjects yet.</div>
          ) : (
            subjects.map((subject) => (
              <div key={subject._id} className="bg-white rounded-xl shadow p-4">
                {editingId === subject._id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      required
                      value={editForm.code}
                      onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                      className="border px-3 py-2 rounded-lg"
                    />
                    <input
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="border px-3 py-2 rounded-lg"
                    />
                    <input
                      type="number"
                      min="1"
                      required
                      value={editForm.units}
                      onChange={(e) => setEditForm({ ...editForm, units: e.target.value })}
                      className="border px-3 py-2 rounded-lg"
                    />
                    <input
                      type="number"
                      min="1"
                      required
                      value={editForm.maxSlots}
                      onChange={(e) => setEditForm({ ...editForm, maxSlots: e.target.value })}
                      className="border px-3 py-2 rounded-lg"
                    />
                    <input
                      value={editForm.schedule}
                      onChange={(e) => setEditForm({ ...editForm, schedule: e.target.value })}
                      className="border px-3 py-2 rounded-lg"
                      placeholder="Schedule"
                    />
                    <input
                      value={editForm.instructor}
                      onChange={(e) => setEditForm({ ...editForm, instructor: e.target.value })}
                      className="border px-3 py-2 rounded-lg"
                      placeholder="Instructor"
                    />
                    <select
                      required
                      value={editForm.yearLevel}
                      onChange={(e) => setEditForm({ ...editForm, yearLevel: e.target.value })}
                      className="border px-3 py-2 rounded-lg"
                    >
                      <option value="">Select Year Level</option>
                      {yearLevels.map((level) => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                    <select
                      required
                      value={editForm.program}
                      onChange={(e) => setEditForm({ ...editForm, program: e.target.value })}
                      className="border px-3 py-2 rounded-lg"
                    >
                      <option value="">Select Program</option>
                      {programs.map((program) => (
                        <option key={program._id || program.code} value={program.code}>
                          {program.code} - {program.name}
                        </option>
                      ))}
                    </select>
                    <div className="md:col-span-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(subject._id)}
                        disabled={savingEdit}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                      >
                        {savingEdit ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">{subject.code} - {subject.name}</p>
                      <p className="text-sm text-gray-500">{subject.schedule || 'No schedule'} | {subject.instructor || 'No instructor'}</p>
                      <p className="text-sm text-gray-500">Program: {subject.program || subject.course || 'Unassigned'}</p>
                      <p className="text-sm text-gray-500">
                        Year Level: {subject.yearLevel ? yearLevels.find((level) => level.value === Number(subject.yearLevel))?.label || `Year ${subject.yearLevel}` : 'Unassigned'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">{subject.units} units</p>
                      <p className="text-xs text-gray-500">{subject.enrolledCount}/{subject.maxSlots} enrolled</p>
                      <div className="mt-2 flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => startEdit(subject)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSubject(subject._id)}
                          disabled={deletingId === subject._id || subject.enrolledCount > 0}
                          title={subject.enrolledCount > 0 ? `Cannot delete: ${subject.enrolledCount} enrolled` : ''}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === subject._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
