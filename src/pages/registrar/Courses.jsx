import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import ModuleBackButton from '../../components/ModuleBackButton';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const initialForm = {
  code: '',
  name: '',
};

const DEFAULT_PROGRAMS = [
  { code: 'BTVTED', name: 'Bachelor of Technical-Vocational Teacher Education' },
  { code: 'BSIS', name: 'Bachelor of Science in Information Systems' },
];

export default function RegistrarCourses() {
  const [form, setForm] = useState(initialForm);
  const [programs, setPrograms] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadPrograms = async () => {
    try {
      const { data } = await API.get('/courses');
      setPrograms(data);
    } catch {
      toast.error('Failed to load programs');
    }
  };

  const createDefaultPrograms = async () => {
    try {
      const existing = await API.get('/courses');
      if (existing.data.length === 0) {
        for (const prog of DEFAULT_PROGRAMS) {
          await API.post('/courses', { code: prog.code, name: prog.name, credits: 0 });
        }
      }
    } catch {
      // Silently fail if defaults can't be created
    }
  };

  useEffect(() => {
    const initPrograms = async () => {
      await createDefaultPrograms();
      loadPrograms();
    };
    initPrograms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/courses', {
        code: form.code,
        name: form.name,
        credits: 0,
      });
      toast.success('Program added successfully');
      setForm(initialForm);
      loadPrograms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add program');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (program) => {
    setEditingId(program._id);
    setEditForm({
      code: program.code || '',
      name: program.name || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(initialForm);
  };

  const saveEdit = async (id) => {
    setSavingEdit(true);
    try {
      await API.put(`/courses/${id}`, {
        code: editForm.code,
        name: editForm.name,
        credits: 0,
      });
      toast.success('Program updated successfully');
      cancelEdit();
      loadPrograms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update program');
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteProgram = async (id) => {
    const ok = window.confirm('Delete this program? This action cannot be undone.');
    if (!ok) return;

    setDeletingId(id);
    try {
      await API.delete(`/courses/${id}`);
      toast.success('Program deleted successfully');
      if (editingId === id) cancelEdit();
      loadPrograms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete program');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="mx-auto max-w-5xl p-6">
        <ModuleBackButton />
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Program Management</h2>

        <form onSubmit={handleSubmit} className="mb-6 grid gap-3 rounded-xl bg-white p-5 shadow md:grid-cols-2">
          <input
            required
            placeholder="Program Code (e.g. BTVTED)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="rounded-lg border px-3 py-2"
          />
          <input
            required
            placeholder="Program Name (e.g. Bachelor of Technical-Vocational Teacher Education)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border px-3 py-2"
          />

          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-2 rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Adding Program...' : 'Add Program'}
          </button>
        </form>

        <div className="space-y-3">
          {programs.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-center text-gray-400 shadow">No programs yet.</div>
          ) : (
            programs.map((program) => (
              <div key={program._id} className="rounded-xl bg-white p-4 shadow">
                {editingId === program._id ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      required
                      value={editForm.code}
                      onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                      className="rounded-lg border px-3 py-2"
                      placeholder="Program Code"
                    />
                    <input
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="rounded-lg border px-3 py-2"
                      placeholder="Program Name"
                    />
                    <div className="flex gap-2 md:col-span-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(program._id)}
                        disabled={savingEdit}
                        className="flex-1 rounded-lg bg-green-600 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {savingEdit ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex-1 rounded-lg border border-gray-300 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{program.code}</p>
                      <p className="text-sm text-gray-600">{program.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(program)}
                        className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProgram(program._id)}
                        disabled={deletingId === program._id}
                        className="rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
                      >
                        Delete
                      </button>
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
