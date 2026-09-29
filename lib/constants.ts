export const APPLICANT_TYPES = [
  {
    id: 'freshmen',
    title: 'Freshmen',
    description: 'First-time college students entering directly from high school or with fewer than 60 transferable semester units.',
    icon: 'GraduationCap',
  },
  {
    id: 'transfer',
    title: 'Transfer Students',
    description: 'Students with 60+ transferable semester units from an accredited college or university.',
    icon: 'ArrowLeftRight',
  },
  {
    id: 'graduate',
    title: 'Graduate & Credential',
    description: 'Students seeking a master\'s degree, doctoral degree, or teaching credential.',
    icon: 'BookOpen',
  },
  {
    id: 'international',
    title: 'International & Veterans',
    description: 'International students, military veterans, and active duty service members.',
    icon: 'Globe',
  },
] as const;

export const APPLICATION_STEPS = [
  { id: 1, title: 'Personal Information', slug: 'personal' },
  { id: 2, title: 'Academic History', slug: 'academic' },
  { id: 3, title: 'Supporting Information', slug: 'supporting' },
  { id: 4, title: 'Program Materials', slug: 'program' },
] as const;

export const ETHNICITY_OPTIONS = [
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Hispanic or Latino',
  'Native Hawaiian or Other Pacific Islander',
  'White',
  'Two or More Races',
  'Prefer not to say',
];

export const GENDER_OPTIONS = [
  'Male',
  'Female',
  'Non-binary',
  'Prefer to self-describe',
  'Prefer not to say',
];

export const CITIZENSHIP_OPTIONS = [
  'U.S. Citizen',
  'Permanent Resident',
  'International',
  'DACA',
  'Other',
];

export const AG_SUBJECTS = [
  { code: 'A', name: 'History / Social Science', years: 2 },
  { code: 'B', name: 'English', years: 4 },
  { code: 'C', name: 'Mathematics', years: 3 },
  { code: 'D', name: 'Laboratory Science', years: 2 },
  { code: 'E', name: 'Language Other Than English', years: 2 },
  { code: 'F', name: 'Visual & Performing Arts', years: 1 },
  { code: 'G', name: 'College Preparatory Elective', years: 1 },
];

export const PORTAL_STATUSES = [
  { id: 'started', label: 'Application Started' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'received', label: 'Received' },
  { id: 'in_review', label: 'In Review' },
  { id: 'decision', label: 'Decision Available' },
];

export const SAMPLE_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Check Your Bronco Email',
    message: 'Important admissions correspondence is sent to your Cal Poly Pomona email. Please check it regularly.',
    date: '2026-09-10',
    type: 'info',
  },
  {
    id: '2',
    title: 'FAFSA Reminder',
    message: 'Submit your FAFSA by March 2, 2027 to be considered for maximum financial aid. School code: 001144.',
    date: '2026-09-15',
    type: 'warning',
  },
  {
    id: '3',
    title: 'Scholarship Deadline Approaching',
    message: 'The Cal Poly Pomona Merit Scholarship application closes December 15, 2026. Apply now!',
    date: '2026-09-17',
    type: 'alert',
  },
];

export const SAMPLE_SCHOLARSHIPS = [
  {
    name: 'CPP Presidential Merit Scholarship',
    amount: '$5,000/year',
    deadline: 'December 15, 2026',
    description: 'Awarded to incoming freshmen with a GPA of 3.8+ and demonstrated leadership.',
  },
  {
    name: 'Bronco Community Service Award',
    amount: '$2,500/year',
    description: 'For students with 200+ hours of community service and a 3.0+ GPA.',
    deadline: 'January 31, 2027',
  },
  {
    name: 'STEM Excellence Scholarship',
    amount: '$3,000/year',
    description: 'For students pursuing degrees in Science, Technology, Engineering, or Mathematics.',
    deadline: 'February 15, 2027',
  },
];
