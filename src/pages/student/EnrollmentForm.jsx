import { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/Navbar';
import ModuleBackButton from '../../components/ModuleBackButton';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DEFAULT_PROGRAMS = [
  { code: 'BTVTED', name: 'Bachelor of Technical-Vocational Teacher Education' },
  { code: 'BSIS', name: 'Bachelor of Science in Information Systems' },
]

const academicYears = [
  '2026 - 2027',
  '2027 - 2028',
  '2028 - 2029',
  '2029 - 2030',
  '2030 - 2031',
];

const yearLevels = [
  { label: '1st Year', value: '1' },
  { label: '2nd Year', value: '2' },
  { label: '3rd Year', value: '3' },
  { label: '4th Year', value: '4' },
];

const genders = ['Male', 'Female', 'Prefer not to say'];

const nationalities = [
  'Filipino', 'American', 'Australian', 'Canadian', 'Chinese', 'Indian',
  'Indonesian', 'Japanese', 'Korean', 'Malaysian', 'Singaporean', 'Thai',
  'Vietnamese', 'Other',
];

const religions = [
  'Roman Catholic', 'Christian', 'Iglesia ni Cristo', 'Islam', 'Seventh-day Adventist',
  'Born Again', 'Protestant', 'Buddhist', 'Hindu', 'Other',
];

const initialForm = {
  academicYear: '2026 - 2027',
  semester: '1st Semester',
  yearLevel: '1',
  program: '',
  studentPhoto: '',
  lastName: '',
  firstName: '',
  middleName: '',
  extensionName: '',
  age: '',
  gender: '',
  birthdate: '',
  placeOfBirth: '',
  nationality: 'Filipino',
  religion: '',
  contactNo: '',
  indigenous: 'No',
  indigenousSpecify: '',
  fourPs: 'No',
  householdId: '',
  presentAddress: '',
  permanentAddress: '',
  sameAddress: false,
  fatherName: '',
  fatherOccupation: '',
  fatherContact: '',
  fatherEducation: '',
  motherName: '',
  motherOccupation: '',
  motherContact: '',
  motherEducation: '',
  guardianName: '',
  guardianRelationship: '',
  guardianContact: '',
  hasSpecialNeeds: 'No',
  specialNeedsSpecify: '',
  medicalCondition: '',
  lastYearLevel: '',
  lastAcademicYear: '',
  lastSchool: '',
  schoolAddress: '',
  agreeToDeclaration: false,
};

const resolveProgramCode = (value, programs) => {
  if (!value) return '';
  const match = programs.find((program) => program._id === value || program.code === value || program.name === value);
  return match ? match.code : value;
};

const calculateAge = (birthdate) => {
  if (!birthdate) return '';

  const birthDate = new Date(birthdate);
  if (Number.isNaN(birthDate.getTime())) return '';

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age > 0 ? String(age) : '';
};

export default function EnrollmentForm() {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [programs, setPrograms] = useState(DEFAULT_PROGRAMS);
  const [loading, setLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [form, setForm] = useState(initialForm);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [subjectsResponse, programsResponse, studentResponse] = await Promise.allSettled([
          API.get('/subjects'),
          API.get('/courses'),
          API.get('/students/me'),
        ]);

        if (subjectsResponse.status === 'fulfilled') {
          setSubjects(subjectsResponse.value.data || []);
        }

        const loadedPrograms = programsResponse.status === 'fulfilled' && programsResponse.value.data?.length
          ? programsResponse.value.data
          : DEFAULT_PROGRAMS;
        setPrograms(loadedPrograms);

        if (studentResponse.status === 'fulfilled') {
          const student = studentResponse.value.data || {};
          setForm((current) => ({
            ...current,
            lastName: student.lastName || '',
            firstName: student.firstName || '',
            yearLevel: student.yearLevel ? String(student.yearLevel) : current.yearLevel,
            program: resolveProgramCode(student.course, loadedPrograms),
          }));
        }
      } catch {
        toast.error('Failed to load enrollment form data');
      }
    };

    loadData();
  }, []);

  const toggleSubject = (id) => {
    setSelected((prev) => (
      prev.includes(id) ? prev.filter((subjectId) => subjectId !== id) : [...prev, id]
    ));
  };

  const totalUnits = useMemo(() => (
    subjects
      .filter((subject) => selected.includes(subject._id))
      .reduce((sum, subject) => sum + Number(subject.units || 0), 0)
  ), [subjects, selected]);

  const filteredSubjects = useMemo(() => (
    subjects.filter((subject) => {
      const subjectProgram = subject.program || subject.course || '';
      const subjectYearLevel = subject.yearLevel ? String(subject.yearLevel) : '';
      const programMatches = !subjectProgram || subjectProgram === form.program;
      const yearLevelMatches = subjectYearLevel === String(form.yearLevel);
      return programMatches && yearLevelMatches;
    })
  ), [subjects, form.yearLevel, form.program]);

  const updateField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'birthdate') {
        next.age = calculateAge(value);
      }
      if (field === 'presentAddress' && current.sameAddress) {
        next.permanentAddress = value;
      }
      if (field === 'sameAddress' && value) {
        next.permanentAddress = current.presentAddress;
      }
      if (field === 'indigenous' && value !== 'Yes') {
        next.indigenousSpecify = '';
      }
      if (field === 'fourPs' && value !== 'Yes') {
        next.householdId = '';
      }
      if (field === 'hasSpecialNeeds' && value !== 'Yes') {
        next.specialNeedsSpecify = '';
      }
      return next;
    });

    if (field === 'yearLevel') {
      setSelected((current) => {
        const allowedSubjectIds = new Set(
          subjects
            .filter((subject) => {
              const subjectProgram = subject.program || subject.course || '';
              const subjectYearLevel = subject.yearLevel ? String(subject.yearLevel) : '';
              const programMatches = !subjectProgram || subjectProgram === current.program;
              const yearLevelMatches = subjectYearLevel === String(value);
              return programMatches && yearLevelMatches;
            })
            .map((subject) => subject._id)
        );

        return current.filter((subjectId) => allowedSubjectIds.has(subjectId));
      });
    }

    if (field === 'program') {
      setSelected((current) => {
        const allowedSubjectIds = new Set(
          subjects
            .filter((subject) => {
              const subjectProgram = subject.program || subject.course || '';
              const subjectYearLevel = subject.yearLevel ? String(subject.yearLevel) : '';
              const programMatches = !subjectProgram || subjectProgram === value;
              const yearLevelMatches = subjectYearLevel === String(current.yearLevel);
              return programMatches && yearLevelMatches;
            })
            .map((subject) => subject._id)
        );

        return current.filter((subjectId) => allowedSubjectIds.has(subjectId));
      });
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setPhotoError('');
      setForm((current) => ({ ...current, studentPhoto: '' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please upload an image file.');
      setForm((current) => ({ ...current, studentPhoto: '' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Photo must be 2MB or smaller.');
      setForm((current) => ({ ...current, studentPhoto: '' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoError('');
      setForm((current) => ({ ...current, studentPhoto: String(reader.result || '') }));
    };
    reader.onerror = () => {
      setPhotoError('Could not read the selected photo.');
      setForm((current) => ({ ...current, studentPhoto: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const permanentAddress = form.sameAddress
      ? form.presentAddress
      : form.permanentAddress;

    const normalizedForm = {
      ...form,
      permanentAddress,
    };

    const requiredFields = [
      ['academicYear', 'Academic Year'],
      ['semester', 'Semester'],
      ['yearLevel', 'Year Level'],
      ['program', 'Program'],
      ['studentPhoto', 'Latest 2x2 ID picture wearing collared shirt in white background'],
      ['lastName', 'Last Name'],
      ['firstName', 'First Name'],
      ['age', 'Age'],
      ['gender', 'Gender'],
      ['birthdate', 'Birthdate'],
      ['placeOfBirth', 'Place of Birth'],
      ['nationality', 'Nationality'],
      ['religion', 'Religion'],
      ['contactNo', 'Contact No.'],
      ['presentAddress', 'Present Address'],
      ['fatherName', 'Father Name'],
      ['fatherOccupation', 'Father Occupation'],
      ['fatherContact', 'Father Contact'],
      ['fatherEducation', 'Father Education'],
      ['motherName', 'Mother Name'],
      ['motherOccupation', 'Mother Occupation'],
      ['motherContact', 'Mother Contact'],
      ['motherEducation', 'Mother Education'],
    ];

    if (!form.sameAddress) {
      requiredFields.splice(10, 0, ['permanentAddress', 'Permanent Address']);
    }

    const firstMissing = requiredFields.find(([field]) => !String(normalizedForm[field] ?? '').trim());

    if (firstMissing) {
      toast.error(`${firstMissing[1]} is required.`);
      return;
    }

    if (form.indigenous === 'Yes' && !form.indigenousSpecify.trim()) {
      toast.error('Please specify the indigenous group.');
      return;
    }

    if (form.fourPs === 'Yes' && !form.householdId.trim()) {
      toast.error('Please provide the household ID for 4Ps.');
      return;
    }

    if (form.hasSpecialNeeds === 'Yes' && !form.specialNeedsSpecify.trim()) {
      toast.error('Please specify the special needs.');
      return;
    }

    if (!form.agreeToDeclaration) {
      toast.error('You must agree to the certification before submitting.');
      return;
    }

    if (selected.length === 0) {
      toast.error('Select at least one subject');
      return;
    }

    if (photoError) {
      toast.error(photoError);
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/enrollments', {
        ...normalizedForm,
        course: normalizedForm.program,
        yearLevel: Number(normalizedForm.yearLevel),
        age: normalizedForm.age ? Number(normalizedForm.age) : '',
        subjectIds: selected,
        subjects: selected,
      });
      toast.success(data?.message || `Enrollment saved successfully.`);
      navigate('/student/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  const programOptions = programs.length > 0 ? programs : DEFAULT_PROGRAMS;

  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="mx-auto max-w-5xl p-6">
        <ModuleBackButton />

        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Colegio de Marinduque</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Enrollment Form</h2>
          <p className="mt-1 text-gray-500">Complete all required fields before submitting your enrollment.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">1. School Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Academic Year</label>
                <select
                  required
                  value={form.academicYear}
                  onChange={(e) => updateField('academicYear', e.target.value)}
                  className="w-full rounded-lg border px-4 py-2"
                >
                  {academicYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Year Level</label>
                <select
                  required
                  value={form.yearLevel}
                  onChange={(e) => updateField('yearLevel', e.target.value)}
                  className="w-full rounded-lg border px-4 py-2"
                >
                  {yearLevels.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Semester</label>
                <div className="flex flex-wrap gap-4">
                  {['1st Semester', '2nd Semester'].map((semester) => (
                    <label key={semester} className="flex items-center gap-2 rounded-lg border px-4 py-2">
                      <input
                        type="radio"
                        name="semester"
                        value={semester}
                        checked={form.semester === semester}
                        onChange={(e) => updateField('semester', e.target.value)}
                        className="text-blue-600"
                      />
                      <span>{semester}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Program</label>
                <select
                  required
                  value={form.program}
                  onChange={(e) => updateField('program', e.target.value)}
                  className="w-full rounded-lg border px-4 py-2"
                >
                  <option value="">Select Program</option>
                  {programOptions.map((program) => (
                    <option key={program._id || program.code} value={program.code}>
                      {program.code} - {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 rounded-xl border border-dashed border-blue-200 bg-blue-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-blue-900">
                  Latest 2x2 ID picture wearing collared shirt in white background
                </label>
                <p className="mb-3 text-sm text-blue-800/80">
                  Upload a clear recent photo. Accepted formats: JPG, PNG. Max size: 2MB.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
                  required
                />
                {photoError ? (
                  <p className="mt-2 text-sm font-medium text-red-600">{photoError}</p>
                ) : form.studentPhoto ? (
                  <div className="mt-3 inline-block rounded-lg border border-blue-200 bg-white p-2 shadow-sm">
                    <img
                      src={form.studentPhoto}
                      alt="Student preview"
                      className="h-28 w-28 rounded-md object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">2. Student Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <input required value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Last Name" />
              <input required value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="First Name" />
              <input value={form.middleName} onChange={(e) => updateField('middleName', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Middle Name" />
              <input value={form.extensionName} onChange={(e) => updateField('extensionName', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Extension Name" />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Gender</label>
                <div className="flex flex-wrap gap-4">
                  {genders.map((gender) => (
                    <label key={gender} className="flex items-center gap-2 rounded-lg border px-4 py-2">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={form.gender === gender}
                        onChange={(e) => updateField('gender', e.target.value)}
                        className="text-blue-600"
                        required
                      />
                      <span>{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              <input type="date" required value={form.birthdate} onChange={(e) => updateField('birthdate', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Birthdate" />
              <div className="flex items-center gap-2 rounded-lg border bg-gray-100 px-4 py-2 text-gray-700">
                <input
                  type="number"
                  min="0"
                  required
                  value={form.age}
                  readOnly
                  className="w-20 bg-transparent outline-none"
                  placeholder="Age"
                />
                <span className="text-sm font-medium">years old</span>
              </div>
              <input required value={form.placeOfBirth} onChange={(e) => updateField('placeOfBirth', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Place of Birth" />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nationality</label>
                <select required value={form.nationality} onChange={(e) => updateField('nationality', e.target.value)} className="w-full rounded-lg border px-4 py-2">
                  {nationalities.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Religion</label>
                <select required value={form.religion} onChange={(e) => updateField('religion', e.target.value)} className="w-full rounded-lg border px-4 py-2">
                  <option value="">Select Religion</option>
                  {religions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              <input required value={form.contactNo} onChange={(e) => updateField('contactNo', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Contact No." />

              <div className="space-y-3 md:col-span-2 rounded-xl border border-gray-200 p-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Indigenous</label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map((choice) => (
                      <label key={choice} className="flex items-center gap-2">
                        <input type="radio" name="indigenous" value={choice} checked={form.indigenous === choice} onChange={(e) => updateField('indigenous', e.target.value)} />
                        <span>{choice}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <input
                  disabled={form.indigenous !== 'Yes'}
                  required={form.indigenous === 'Yes'}
                  value={form.indigenousSpecify}
                  onChange={(e) => updateField('indigenousSpecify', e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 disabled:bg-gray-100"
                  placeholder="Specify if Yes"
                />
              </div>

              <div className="space-y-3 md:col-span-2 rounded-xl border border-gray-200 p-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">4Ps Beneficiary</label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map((choice) => (
                      <label key={choice} className="flex items-center gap-2">
                        <input type="radio" name="fourPs" value={choice} checked={form.fourPs === choice} onChange={(e) => updateField('fourPs', e.target.value)} />
                        <span>{choice}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <input
                  disabled={form.fourPs !== 'Yes'}
                  required={form.fourPs === 'Yes'}
                  value={form.householdId}
                  onChange={(e) => updateField('householdId', e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 disabled:bg-gray-100"
                  placeholder="Household ID"
                />
              </div>

              <div className="md:col-span-2 space-y-3 rounded-xl border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-800">Address</h4>
                <input required value={form.presentAddress} onChange={(e) => updateField('presentAddress', e.target.value)} className="w-full rounded-lg border px-4 py-2" placeholder="Present Address" />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={form.sameAddress} onChange={(e) => updateField('sameAddress', e.target.checked)} />
                  Permanent address is the same as present address
                </label>
                <input
                  required={!form.sameAddress}
                  disabled={form.sameAddress}
                  value={form.permanentAddress}
                  onChange={(e) => updateField('permanentAddress', e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 disabled:bg-gray-100"
                  placeholder="Permanent Address"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">3. Parent / Guardian Info</h3>
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 p-4">
                <h4 className="mb-3 font-semibold text-gray-800">Father</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <input required value={form.fatherName} onChange={(e) => updateField('fatherName', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Father's Name" />
                  <input required value={form.fatherOccupation} onChange={(e) => updateField('fatherOccupation', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Occupation" />
                  <input required value={form.fatherContact} onChange={(e) => updateField('fatherContact', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Contact No." />
                  <input required value={form.fatherEducation} onChange={(e) => updateField('fatherEducation', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Educational Attainment" />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <h4 className="mb-3 font-semibold text-gray-800">Mother</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <input required value={form.motherName} onChange={(e) => updateField('motherName', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Mother's Name" />
                  <input required value={form.motherOccupation} onChange={(e) => updateField('motherOccupation', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Occupation" />
                  <input required value={form.motherContact} onChange={(e) => updateField('motherContact', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Contact No." />
                  <input required value={form.motherEducation} onChange={(e) => updateField('motherEducation', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Educational Attainment" />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <h4 className="mb-3 font-semibold text-gray-800">Guardian</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <input value={form.guardianName} onChange={(e) => updateField('guardianName', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Guardian's Name" />
                  <input value={form.guardianRelationship} onChange={(e) => updateField('guardianRelationship', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Relationship" />
                  <input value={form.guardianContact} onChange={(e) => updateField('guardianContact', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Contact No." />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">4. Special Needs</h3>
            <div className="space-y-3">
              <div className="flex gap-4">
                {['Yes', 'No'].map((choice) => (
                  <label key={choice} className="flex items-center gap-2">
                    <input type="radio" name="hasSpecialNeeds" value={choice} checked={form.hasSpecialNeeds === choice} onChange={(e) => updateField('hasSpecialNeeds', e.target.value)} />
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
              <input
                disabled={form.hasSpecialNeeds !== 'Yes'}
                required={form.hasSpecialNeeds === 'Yes'}
                value={form.specialNeedsSpecify}
                onChange={(e) => updateField('specialNeedsSpecify', e.target.value)}
                className="w-full rounded-lg border px-4 py-2 disabled:bg-gray-100"
                placeholder="Specify special needs"
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">5. Medical Condition</h3>
            <textarea
              value={form.medicalCondition}
              onChange={(e) => updateField('medicalCondition', e.target.value)}
              className="min-h-28 w-full rounded-lg border px-4 py-2"
              placeholder="List any medical condition, allergies, or restrictions"
            />
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">6. Returning / Transferee</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <input value={form.lastYearLevel} onChange={(e) => updateField('lastYearLevel', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Last Year Level" />
              <input value={form.lastAcademicYear} onChange={(e) => updateField('lastAcademicYear', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Last Academic Year" />
              <input value={form.lastSchool} onChange={(e) => updateField('lastSchool', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="Last School" />
              <input value={form.schoolAddress} onChange={(e) => updateField('schoolAddress', e.target.value)} className="rounded-lg border px-4 py-2" placeholder="School Address" />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">7. Subject Enrollment</h3>
            {filteredSubjects.length === 0 ? (
              <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-400">
                No subjects available for this year level.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSubjects.map((subject) => (
                  <label
                    key={subject._id}
                    className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border-2 p-4 transition ${
                      selected.includes(subject._id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-transparent bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selected.includes(subject._id)} onChange={() => toggleSubject(subject._id)} className="mt-1 h-4 w-4 accent-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-800">{subject.name}</p>
                          <p className="text-sm text-gray-500">{subject.code} • {subject.schedule}</p>
                          <p className="text-sm text-gray-400">{subject.instructor}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-600">{subject.units} units</span>
                      <p className="text-xs text-gray-400">{subject.maxSlots - subject.enrolledCount} slots left</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">8. Certification</h3>
            <p className="text-sm leading-6 text-gray-600">
              I hereby certify that all information provided in this enrollment form is true and correct to the best of my knowledge. I give my consent to Colegio de Marinduque to collect, use, verify, and stored learner&apos;s personal information for the purpose of processing his/her enrollment and administering related services. The personal information provided shall be treated as confidential, in accordance with the Data Privacy Act of 2012.
            </p>
            <label className="mt-4 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <input
                type="checkbox"
                checked={form.agreeToDeclaration}
                onChange={(e) => updateField('agreeToDeclaration', e.target.checked)}
                className="mt-1 h-4 w-4 accent-blue-600"
                required
              />
              <span className="text-sm text-gray-700">I agree to the certification and consent statement.</span>
            </label>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-gray-600">Selected: <strong>{selected.length} subjects</strong></p>
                <p className="text-gray-600">Total Units: <strong>{totalUnits}</strong></p>
                <p className="text-gray-600">Estimated Fee: <strong>₱{totalUnits * 500}</strong></p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Enrollment'}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}