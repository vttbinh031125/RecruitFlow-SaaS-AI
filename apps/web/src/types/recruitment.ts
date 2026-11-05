export type User = {
  id: string;
  email: string;
  fullName: string;
  platformRole: string;
};
export type Membership = {
  role: string;
  organization: { id: string; name: string; slug: string };
};
export type Job = {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  employmentType: string;
  status: string;
  organization: { name: string; slug: string };
};
export type Application = {
  id: string;
  status: string;
  appliedAt: string;
  allowedNextStatuses: string[];
  job: { id: string; title: string; organizationId: string };
  candidate: { id: string; user: { fullName: string; email: string } };
};
export type Analysis = {
  demonstration: boolean;
  provider: string;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
};
