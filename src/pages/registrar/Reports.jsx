import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import ModuleBackButton from '../../components/ModuleBackButton';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import cdmLogo from '../../assets/CDM - Edited.png';

export default function RegistrarReports() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await API.get('/reports/students-list');
        setStudents(data.students || []);
      } catch (err) {
        toast.error('Failed to load student list');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectStudent = async (student) => {
    try {
      const { data } = await API.get(`/reports/certificate/${student.enrollmentId}`);
      setSelectedStudent(student);
      setCertificateData(data.certificateData);
    } catch (err) {
      toast.error('Failed to load certificate');
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const appData = certificateData?.applicationData || {};
  const assessedFees = certificateData?.assessedFees || {};
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A');
  const formatAmount = (value) => Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalSubjects = certificateData?.subjects?.length || 0;
  const totalUnits = certificateData?.subjects?.reduce((sum, subject) => sum + Number(subject.units || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <ModuleBackButton />
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Student Reports</h2>
          <p className="text-gray-500 mt-2">Generate and print Certificates of Registration</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl shadow">
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="overflow-y-auto max-h-96">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading students...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No students found</div>
              ) : (
                <div className="space-y-2 p-2">
                  {filteredStudents.map(student => (
                    <button
                      key={student.enrollmentId}
                      onClick={() => handleSelectStudent(student)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedStudent?.enrollmentId === student.enrollmentId
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-800">{student.studentName}</p>
                      <p className="text-xs text-gray-600">{student.program} - Year {student.yearLevel}</p>
                      <p className="text-xs text-gray-500">{student.semester}, {student.academicYear}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {certificateData ? (
              <div>
                <div className="mb-6 flex gap-3 no-print">
                  <button
                    onClick={handlePrint}
                    disabled={isPrinting}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 transition"
                  >
                    🖨️ Print Certificate
                  </button>
                  <button
                    onClick={() => {
                      toast.info('Use browser print to save as PDF');
                      window.print();
                    }}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold transition"
                  >
                    📄 Save as PDF
                  </button>
                </div>

                <div id="certificate" className="bg-white border border-black overflow-hidden text-black">
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-start gap-4">
                      <img src={cdmLogo} alt="CDM logo" className="w-28 h-28 object-contain shrink-0" />
                      <div className="flex-1 text-center leading-tight pt-2">
                        <p className="text-lg">Republic of the Philippines</p>
                        <h2 className="text-3xl font-black font-serif tracking-tight">Colegio de Marinduque</h2>
                        <p className="text-sm">Masiga, Gasan, Marinduque</p>
                        <h1 className="mt-4 text-3xl font-black italic uppercase tracking-tight">Certificate of Registration and Billing</h1>
                      </div>
                      <div className="w-72 pt-6 text-right">
                        <div className="flex items-end justify-end gap-3">
                          <span className="text-lg">Registration No :</span>
                          <span className="text-3xl font-medium text-red-900">{certificateData.blockchainHash?.slice(0, 6) || 'N/A'}</span>
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-2 text-sm">
                          <span>Academic Year/Term :</span>
                          <span className="text-2xl font-bold text-red-900">{certificateData.semester} AY {certificateData.academicYear}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-black bg-indigo-100 px-4 py-2 text-center font-semibold uppercase">
                    Student General Information
                  </div>

                  <div className="grid grid-cols-12 border-b border-black">
                    <div className="col-span-7 border-r border-black p-4 text-sm">
                      <div className="space-y-2">
                        <div className="grid grid-cols-[auto,1fr] gap-x-2">
                          <span>Student No:</span>
                          <span className="font-bold">{certificateData.studentNumber || certificateData.studentId}</span>
                        </div>
                        <div className="grid grid-cols-[auto,1fr] gap-x-2">
                          <span>Name:</span>
                          <span className="font-bold uppercase">{certificateData.studentName}</span>
                        </div>
                        <div className="grid grid-cols-[auto,1fr] gap-x-2">
                          <span>Gender:</span>
                          <span>{appData.gender || certificateData.gender || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-[auto,1fr] gap-x-2">
                          <span>Date of Birth:</span>
                          <span className="font-medium">{formatDate(appData.birthdate || certificateData.birthdate)}</span>
                        </div>
                        <div className="grid grid-cols-[auto,1fr] gap-x-2">
                          <span>Place of Birth:</span>
                          <span>{appData.placeOfBirth || certificateData.placeOfBirth || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-[auto,1fr] gap-x-2">
                          <span>Address:</span>
                          <span>{appData.presentAddress || appData.permanentAddress || appData.address || certificateData.address || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-5 p-4 text-sm">
                      <div className="space-y-2">
                        <div className="grid grid-cols-[auto,1fr] gap-x-2">
                          <span>College:</span>
                          <span className="font-medium">Colegio de Marinduque</span>
                        </div>
                        <div className="grid grid-cols-[auto,1fr] gap-x-2">
                          <span>Program:</span>
                          <span className="font-medium">{certificateData.program || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-[auto,1fr] gap-x-2">
                          <span>Major:</span>
                          <span>{appData.major || certificateData.major || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-[auto,1fr] gap-x-2">
                          <span>Curriculum:</span>
                          <span>{appData.curriculum || certificateData.curriculum || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-[auto,1fr] gap-x-2">
                          <span>Year Level:</span>
                          <span className="font-medium">{certificateData.yearLevel || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-[auto,1fr] gap-x-2">
                          <span>Scholarship/Discount:</span>
                          <span>{appData.scholarshipDiscount || certificateData.scholarshipDiscount || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-black">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-indigo-100 uppercase">
                          <th className="border-r border-black px-2 py-1 text-left w-[9%]">Code</th>
                          <th className="border-r border-black px-2 py-1 text-left w-[31%]">Subject Title</th>
                          <th className="border-r border-black px-2 py-0 text-center w-[11%]">
                            <div className="flex flex-col leading-none">
                              <span className="text-base font-bold">U</span>
                              <span className="text-xs tracking-[0.35em]">UNIT</span>
                            </div>
                          </th>
                          <th className="border-r border-black px-2 py-1 text-left w-[10%]">Section</th>
                          <th className="border-r border-black px-2 py-1 text-left w-[24%]">Schedule / Room</th>
                          <th className="px-2 py-1 text-left w-[15%]">Faculty</th>
                        </tr>
                        <tr className="bg-indigo-100 uppercase text-xs">
                          <th className="border-r border-black"></th>
                          <th className="border-r border-black"></th>
                          <th className="border-r border-black px-1 py-0 text-center">
                            <div className="grid grid-cols-3 text-[10px] font-semibold tracking-wider">
                              <span>Lec</span>
                              <span>Lab</span>
                              <span>Credit</span>
                            </div>
                          </th>
                          <th className="border-r border-black"></th>
                          <th className="border-r border-black"></th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {certificateData.subjects?.length ? certificateData.subjects.map((subject, index) => (
                          <tr key={`${subject.code || subject.name || index}`} className="align-top">
                            <td className="border-r border-t border-black px-2 py-1">{subject.code || 'N/A'}</td>
                            <td className="border-r border-t border-black px-2 py-1">{subject.name || 'N/A'}</td>
                            <td className="border-r border-t border-black px-2 py-1">
                              <div className="grid grid-cols-3 text-center font-medium">
                                <span>0</span>
                                <span>0</span>
                                <span>{Number(subject.units || 0)}</span>
                              </div>
                            </td>
                            <td className="border-r border-t border-black px-2 py-1">{appData.section || 'N/A'}</td>
                            <td className="border-r border-t border-black px-2 py-1 whitespace-pre-line">{subject.schedule || 'N/A'}</td>
                            <td className="border-t border-black px-2 py-1 whitespace-pre-line">{subject.instructor || 'N/A'}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td className="border-t border-black px-2 py-3 text-center" colSpan={6}>No subjects available</td>
                          </tr>
                        )}

                        <tr className="font-semibold">
                          <td className="border-t border-black px-2 py-2" colSpan={2}>
                            <span>Total Subject/s:</span>
                            <span className="inline-block ml-4 min-w-14 border-b border-black text-center">{totalSubjects}</span>
                          </td>
                          <td className="border-t border-black px-2 py-2" colSpan={2}>
                            <span>Total Unit(s):</span>
                            <span className="inline-block ml-4 min-w-14 border-b border-black text-center">{totalUnits}</span>
                          </td>
                          <td className="border-t border-black px-2 py-2" colSpan={2}></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-12">
                    <div className="col-span-5 border-r border-black p-4">
                      <p className="text-center text-lg italic font-semibold">PLEDGE UPON ADMISSION</p>
                      <p className="mt-2 text-justify text-sm leading-5">
                        Upon admission to Colegio de Marinduque, I hereby promise with sincerity to obey all the existing rules and regulations established by this institution.
                      </p>

                      <div className="mt-4 text-sm">
                        <p className="font-semibold italic">Please check</p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-6 w-6 border border-gray-400"></div>
                          <span>Grantee of R.A. 10931 (Free Tuition)</span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-6 w-6 border border-gray-400"></div>
                          <span>Non Grantee</span>
                        </div>
                      </div>

                      <div className="mt-4 text-sm leading-5">
                        <p>
                          As grantee of R.A. 10931 I will take into consideration the school rules and the data privacy consent required by the institution.
                        </p>
                        <p className="mt-3">
                          I authorize the school to process, store, and verify my records in relation to enrollment and certification.
                        </p>
                      </div>

                      <div className="mt-6 text-sm">
                        <div className="flex items-end gap-4">
                          <span className="font-semibold">Student Signature:</span>
                          <div className="flex-1 border-b border-black h-6"></div>
                        </div>
                        <div className="mt-4 flex items-start gap-4">
                          <span className="font-semibold min-w-20">Address:</span>
                          <span className="flex-1">{appData.presentAddress || appData.permanentAddress || appData.address || certificateData.address || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="mt-6 text-[11px] leading-4">
                        <p className="font-semibold">Data Privacy Consent:</p>
                        <p>
                          In accordance with RA 10173 or Data Privacy Act of 2012, I consent to the collection, use, processing, and disclosure of my personal data for enrollment, verification, and record-keeping purposes.
                        </p>
                      </div>
                    </div>

                    <div className="col-span-7 p-4">
                      <div className="border border-black">
                        <div className="bg-indigo-100 border-b border-black px-4 py-2 text-center text-xl font-semibold tracking-[0.5em] uppercase">
                          Assessed Fees
                        </div>
                        <div className="p-4 text-sm">
                          <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
                            <div className="font-semibold">Tuition Fee</div>
                            <div>{formatAmount(assessedFees.tuitionFee)}</div>
                            <div>Library Fee</div>
                            <div>{formatAmount(assessedFees.libraryFee)}</div>
                            <div>Computer Lab Fee</div>
                            <div>{formatAmount(assessedFees.computerLabFee)}</div>
                            <div>Internet Fee</div>
                            <div>{formatAmount(assessedFees.internetFee)}</div>
                            <div>Other</div>
                            <div>{formatAmount(assessedFees.otherFee)}</div>
                          </div>

                          <div className="mt-4 border border-black">
                            <div className="grid grid-cols-[1fr_auto] border-b border-black px-3 py-1 font-semibold">
                              <span>TOTAL ASSESSED</span>
                              <span>{formatAmount(assessedFees.totalAssessed)}</span>
                            </div>
                            <div className="grid grid-cols-[1fr_auto] border-b border-black px-3 py-1 font-semibold">
                              <span>DISCOUNT</span>
                              <span>{formatAmount(assessedFees.discount)}</span>
                            </div>
                            <div className="grid grid-cols-[1fr_auto] border-b border-black px-3 py-1 font-semibold">
                              <span>TOTAL PAYMENT</span>
                              <span>{formatAmount(assessedFees.totalPayment)}</span>
                            </div>
                            <div className="grid grid-cols-[1fr_auto] px-3 py-1 font-semibold">
                              <span>OUTSTANDING BALANCE</span>
                              <span>{formatAmount(assessedFees.outstandingBalance)}</span>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-semibold">OR No. :</span>
                              <span className="ml-2">Unifast Scholar</span>
                            </div>
                            <div>
                              <span className="font-semibold">Amount :</span>
                              <span className="ml-2">{formatAmount(assessedFees.totalAssessed)}</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="font-semibold">RELEASED BY:</p>
                            <div className="mt-10 border-t border-black pt-2 text-center">Enrollment Officer</div>
                          </div>

                          <div className="mt-8 text-center">
                            <p className="font-semibold uppercase">Approved:</p>
                            <p className="mt-4 text-lg font-bold">University Registrar</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-black px-4 py-4">
                    <div className="flex items-end justify-between gap-6 text-sm">
                      <div className="flex items-end gap-4">
                        <div className="h-14 w-40 border-b border-black">
                          <div className="mt-8 text-center font-mono text-[10px] tracking-[0.25em]">
                            ||| || ||| || ||| |||
                          </div>
                        </div>
                        <div className="font-mono text-base">{certificateData.studentNumber || certificateData.studentId}</div>
                      </div>
                      <div className="text-right">
                        <p>Date of Registration : {formatDate(certificateData.enrollmentDate)}</p>
                        <p>Date Printed : {formatDate(new Date())}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-black bg-indigo-100 px-4 py-2 text-center text-sm font-semibold uppercase">
                    Keep this certificate. You will be required to present this in all your dealings with Colegio de Marinduque.
                  </div>
                </div>

                <style>{`\n                  @media print {\n                    body {\n                      margin: 0;\n                      padding: 0;\n                      -webkit-print-color-adjust: exact;\n                      print-color-adjust: exact;\n                    }\n                    .no-print {\n                      display: none !important;\n                    }\n                    #certificate {\n                      box-shadow: none;\n                      border-radius: 0;\n                      width: 100%;\n                    }\n                    @page {\n                      size: A4 portrait;\n                      margin: 8mm;\n                    }\n                  }\n                `}</style>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500 text-lg">Select a student from the list to view their certificate</p>
                <p className="text-sm text-gray-400 mt-2">Search or scroll to find the student</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
