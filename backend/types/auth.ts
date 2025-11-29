import { z } from 'zod';

export const signupStudentSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  grade: z.number().int().min(1).max(12),
  board: z.string().default('CBSE'),
  dateOfBirth: z.string().optional(),
  schoolName: z.string().optional(),
});

export const signupParentSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const linkStudentSchema = z.object({
  studentEmail: z.string().email('Invalid email address'),
  relationship: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export type SignupStudentInput = z.infer<typeof signupStudentSchema>;
export type SignupParentInput = z.infer<typeof signupParentSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LinkStudentInput = z.infer<typeof linkStudentSchema>;

export type UserRole = 'student' | 'parent' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface StudentProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  grade: number;
  board: string;
  schoolName?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  currentStreak: number;
  totalPoints: number;
  level: number;
}

export interface ParentProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  linkedStudents: {
    id: string;
    fullName: string;
    grade: number;
    relationship?: string;
    isPrimary: boolean;
  }[];
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  profile: StudentProfileResponse | ParentProfileResponse;
}
