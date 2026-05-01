export default function StudentInfoModal({ enrollment, isOpen, onClose }) {
  if (!isOpen || !enrollment) return null;

  const student = enrollment.student || {};
  const user = student.user || {};
  const appData = enrollment.applicationData || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b bg-blue-700 p-6 text-white">
            <div>
              <h2 className="text-2xl font-bold">Student Information</h2>
              <p className="text-sm text-blue-100">{student.studentId || 'N/A'}</p>
            </div>
            <button onClick={onClose} className="rounded p-1 text-2xl hover:bg-white/20">✕</button>
          </div>

          <div className="space-y-6 p-6">
            <section>
              <h3 className="mb-3 border-b-2 border-blue-600 pb-2 text-lg font-bold text-gray-800">Basic Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div><p className="text-xs uppercase text-gray-500">Student Name</p><p className="font-medium text-gray-800">{user.name || `${student.firstName || ''} ${student.lastName || ''}`}</p></div>
                <div><p className="text-xs uppercase text-gray-500">Email</p><p className="font-medium text-gray-800">{user.email || 'N/A'}</p></div>
                <div><p className="text-xs uppercase text-gray-500">Program</p><p className="font-medium text-gray-800">{appData.program || appData.course || student.course || 'N/A'}</p></div>
                <div><p className="text-xs uppercase text-gray-500">Year Level</p><p className="font-medium text-gray-800">{appData.yearLevel || student.yearLevel || 'N/A'}</p></div>
                <div><p className="text-xs uppercase text-gray-500">Semester</p><p className="font-medium text-gray-800">{enrollment.semester || 'N/A'}</p></div>
                <div><p className="text-xs uppercase text-gray-500">Academic Year</p><p className="font-medium text-gray-800">{enrollment.academicYear || 'N/A'}</p></div>
              </div>
            </section>

            <section>
              <h3 className="mb-3 border-b-2 border-blue-600 pb-2 text-lg font-bold text-gray-800">Contact & Address</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div><p className="text-xs uppercase text-gray-500">Gender</p><p className="font-medium text-gray-800">{appData.gender || 'N/A'}</p></div>
                <div><p className="text-xs uppercase text-gray-500">Birthdate</p><p className="font-medium text-gray-800">{appData.birthdate ? new Date(appData.birthdate).toLocaleDateString() : 'N/A'}</p></div>
                <div className="md:col-span-2"><p className="text-xs uppercase text-gray-500">Address</p><p className="font-medium text-gray-800">{appData.presentAddress || appData.address || appData.permanentAddress || 'N/A'}</p></div>
              </div>
            </section>

            <section>
              <h3 className="mb-3 border-b-2 border-blue-600 pb-2 text-lg font-bold text-gray-800">Enrollment Status</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div><p className="text-xs uppercase text-gray-500">Status</p><p className="font-medium text-gray-800">{enrollment.status}</p></div>
                <div><p className="text-xs uppercase text-gray-500">Remarks</p><p className="font-medium text-gray-800">{enrollment.remarks || 'None'}</p></div>
                <div><p className="text-xs uppercase text-gray-500">Drop Remarks</p><p className="font-medium text-gray-800">{enrollment.dropRemarks || 'None'}</p></div>
              </div>
            </section>

            {Array.isArray(enrollment.dropEvidence) && enrollment.dropEvidence.length > 0 && (
              <section>
                <h3 className="mb-3 border-b-2 border-blue-600 pb-2 text-lg font-bold text-gray-800">Drop Evidence</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  {enrollment.dropEvidence.map((file) => (
                    <li key={file}>
                      <a href={file} target="_blank" rel="noreferrer" className="underline hover:text-blue-900">
                        {file.split('/').pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}