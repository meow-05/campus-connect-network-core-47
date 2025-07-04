
// All enums, roles, mappings
export const USER_ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  MENTOR: 'mentor',
  PLATFORM_ADMIN: 'platform_admin'
} as const;

export const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const PROJECT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
} as const;

export const DEPARTMENTS = {
  COMPUTER_SCIENCE: 'Computer Science',
  ELECTRONICS: 'Electronics',
  INFORMATION_TECHNOLOGY: 'Information Technology',
  CIVIL: 'Civil',
  MECHANICS: 'Mechanics',
  ARTIFICIAL_INTELLIGENCE: 'Artificial Intelligence'
} as const;
