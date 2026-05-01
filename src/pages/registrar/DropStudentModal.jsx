import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function DropStudentModal({ enrollment, isOpen, onClose, onDropped }) {
  const [dropRemarks, setDropRemarks] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDropRemarks('');
      setEvidenceFiles([]);
    }
  }, [isOpen, enrollment]);

  if (!isOpen || !enrollment) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!dropRemarks.trim()) {
      toast.error('Please enter a remark before dropping a student');
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('dropRemarks', dropRemarks);
      evidenceFiles.forEach((file) => formData.append('evidenceFiles', file));

      await API.post(`/enrollment/${enrollment._id}/drop`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Student dropped successfully');
      onDropped?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to drop student');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl">
          <div className="border-b bg-red-600 p-6 text-white">
            <h2 className="text-2xl font-bold">Drop Student</h2>
            <p className="text-sm text-red-100">{enrollment.student?.user?.name || enrollment.studentName || 'Student'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
              Dropping a student requires a written remark and at least one evidence file if available.
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Drop Remark</label>
              <textarea
                value={dropRemarks}
                onChange={(e) => setDropRemarks(e.target.value)}
                required
                rows={5}
                placeholder="Explain why the student is being dropped..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Evidence Files</label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => setEvidenceFiles(Array.from(e.target.files || []))}
                className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-white hover:file:bg-red-700"
              />
              <p className="mt-2 text-xs text-gray-500">Accepted: images or PDF. You can upload multiple files.</p>
              {evidenceFiles.length > 0 && (
                <ul className="mt-3 space-y-1 rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
                  {evidenceFiles.map((file) => (
                    <li key={`${file.name}-${file.size}`}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {isSaving ? 'Dropping...' : 'Confirm Drop'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}