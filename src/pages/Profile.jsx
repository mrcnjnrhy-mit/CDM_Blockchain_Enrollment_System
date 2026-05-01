import { useState } from 'react';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import ModuleBackButton from '../components/ModuleBackButton';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [studentInfo, setStudentInfo] = useState(null);
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    course: '',
    yearLevel: 1,
    section: '',
  });
  const [savingStudent, setSavingStudent] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/students/me')
      .then(({ data }) => {
        setStudentInfo(data);
        setStudentForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          course: data.course || '',
          yearLevel: data.yearLevel || 1,
          section: data.section || '',
        });
      })
      .catch(() => setStudentInfo(null));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword && form.currentPassword && form.newPassword === form.currentPassword) {
      return toast.error('New password must be different from current password');
    }

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return toast.error('New password and confirmation do not match');
    }

    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated');
      setForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setSavingStudent(true);

    try {
      const { data } = await API.put('/students/me', {
        ...studentForm,
        yearLevel: Number(studentForm.yearLevel),
      });
      setStudentInfo(data);
      setStudentForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        course: data.course || '',
        yearLevel: data.yearLevel || 1,
        section: data.section || '',
      });
      toast.success('Student information updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Student information update failed');
    } finally {
      setSavingStudent(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="mx-auto max-w-xl p-6">
        <ModuleBackButton />
        <h2 className="mb-2 text-2xl font-bold text-gray-800">Edit Profile</h2>
        <p className="mb-6 text-sm text-gray-500">Update your information and password here.</p>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border px-4 py-2"
              required
            />
          </div>

          <div className="rounded-lg border border-dashed border-gray-200 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">Change Password</p>
            <div className="space-y-3">
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
                placeholder="Current password"
              />
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
                placeholder="New password"
              />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Student Information</h3>
          {studentInfo ? (
            <>
              <div className="mb-5 grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-2">
                <div>
                  <p className="text-gray-500">Student ID</p>
                  <p className="font-semibold">{studentInfo.studentId || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-semibold capitalize">{studentInfo.status || 'pending'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Registered Email</p>
                  <p className="font-semibold">{studentInfo.user?.email || user?.email || 'N/A'}</p>
                </div>
              </div>

              <form onSubmit={handleStudentSubmit} className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">First Name</label>
                    <input
                      value={studentForm.firstName}
                      onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                      className="w-full rounded-lg border px-4 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Last Name</label>
                    <input
                      value={studentForm.lastName}
                      onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                      className="w-full rounded-lg border px-4 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Course</label>
                    <input
                      value={studentForm.course}
                      onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                      className="w-full rounded-lg border px-4 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Year Level</label>
                    <input
                      type="number"
                      min="1"
                      value={studentForm.yearLevel}
                      onChange={(e) => setStudentForm({ ...studentForm, yearLevel: e.target.value })}
                      className="w-full rounded-lg border px-4 py-2"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Section</label>
                    <input
                      value={studentForm.section}
                      onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                      className="w-full rounded-lg border px-4 py-2"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingStudent}
                  className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingStudent ? 'Saving Student Info...' : 'Save Student Information'}
                </button>
              </form>
            </>
          ) : (
            <p className="text-sm text-gray-500">No student information available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}