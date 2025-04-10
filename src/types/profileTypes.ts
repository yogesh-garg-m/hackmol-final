
import { Tables } from "@/integrations/supabase/types";

// Define Profile type based on the existing Supabase types
export type Profile = Tables<"profiles">;

// Type for the signup form data
export interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  rollNumber: string;
  yearOfStudy: number;
  branch: string;
  bloodGroup: string;
}

// Options for blood groups
export const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// Options for branches
export const branchOptions = [
  'Computer Science',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Electronics and Communication',
  'Information Technology',
  'Other'
];

// Options for year of study
export const yearOfStudyOptions = [1, 2, 3, 4, 5];
