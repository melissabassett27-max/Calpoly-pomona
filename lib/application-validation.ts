type ApplicationSectionData = Record<string, unknown> | null | undefined;

const REQUIRED_FIELDS: Record<number, { key: string; label: string }[]> = {
  1: [
    { key: 'firstName', label: 'Legal first name' },
    { key: 'lastName', label: 'Legal last name' },
    { key: 'dateOfBirth', label: 'Date of birth' },
    { key: 'citizenship', label: 'Citizenship status' },
    { key: 'email', label: 'Email address' },
    { key: 'phone', label: 'Phone number' },
    { key: 'street', label: 'Street address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'zip', label: 'Zip code' },
    { key: 'country', label: 'Country' },
    { key: 'emergencyName', label: 'Emergency contact name' },
    { key: 'emergencyRelationship', label: 'Emergency contact relationship' },
    { key: 'emergencyPhone', label: 'Emergency contact phone' },
  ],
  2: [
    { key: 'hsName', label: 'High school name' },
    { key: 'hsCity', label: 'High school city' },
    { key: 'hsState', label: 'High school state' },
    { key: 'hsGradDate', label: 'High school graduation date' },
    { key: 'hsGpa', label: 'High school GPA' },
  ],
  3: [{ key: 'essay1', label: 'Personal statement (Prompt 1)' }],
  4: [
    { key: 'college', label: 'College/school' },
    { key: 'major', label: 'Major' },
    { key: 'entryTerm', label: 'Entry term' },
    { key: 'enrollmentType', label: 'Enrollment type' },
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getSectionCompletionIssues(section: number, value: unknown): string[] {
  const data: ApplicationSectionData = isRecord(value) ? value : null;
  const requiredFields = REQUIRED_FIELDS[section];
  if (!requiredFields) return ['Unknown application section'];

  const missingFields = requiredFields
    .filter(({ key }) => {
      const value = data?.[key];
      return typeof value !== 'string' || !value.trim();
    })
    .map(({ label }) => label);

  if (section === 1 && data?.email && typeof data.email === 'string'
    && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    missingFields.push('Valid email address');
  }
  if (section === 2 && data?.hsGpa !== undefined && data.hsGpa !== '') {
    const gpa = Number(data.hsGpa);
    if (!Number.isFinite(gpa) || gpa < 0 || gpa > 4) missingFields.push('GPA between 0.00 and 4.00');
  }

  return missingFields;
}

export function getApplicationCompletionIssues(application: {
  section1Data?: unknown;
  section2Data?: unknown;
  section3Data?: unknown;
  section4Data?: unknown;
  section1Complete?: boolean;
  section2Complete?: boolean;
  section3Complete?: boolean;
  section4Complete?: boolean;
}): string[] {
  const issues: string[] = [];
  const sections = [
    { number: 1, title: 'Personal Information', complete: application.section1Complete, data: application.section1Data },
    { number: 2, title: 'Academic History', complete: application.section2Complete, data: application.section2Data },
    { number: 3, title: 'Supporting Information', complete: application.section3Complete, data: application.section3Data },
    { number: 4, title: 'Program Materials', complete: application.section4Complete, data: application.section4Data },
  ];

  for (const section of sections) {
    if (!section.complete) issues.push(`Step ${section.number}: ${section.title} has not been completed.`);
    else {
      issues.push(...getSectionCompletionIssues(section.number, section.data)
        .map((issue) => `Step ${section.number}: ${issue}.`));
    }
  }

  return issues;
}
