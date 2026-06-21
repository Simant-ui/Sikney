import { z } from "zod";

const phoneRegex = /^[0-9+\-\s]{7,15}$/;
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const signupSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required").max(80),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(phoneRegex, "Invalid phone number"),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(["student", "teacher"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits"),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const resendOtpSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(["verify-email", "reset-password"]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    code: z.string().length(6),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(80),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  bio: z.string().max(500).optional(),
});

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title is required").max(120),
  description: z.string().min(10, "Description is required").max(2000),
  category: z.string().min(2, "Category is required"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  price: z.number().min(0, "Price cannot be negative"),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const createAssignmentSchema = z.object({
  courseId: z.string().min(1, "Select a course"),
  title: z.string().min(3, "Title is required").max(150),
  instructions: z.string().min(5, "Instructions are required").max(3000),
  attachmentUrl: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  maxMarks: z.number().min(1, "Max marks must be at least 1"),
  isPublished: z.boolean().optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export const gradeSubmissionSchema = z.object({
  marksObtained: z.number().min(0),
  feedback: z.string().max(2000).optional(),
});

export const createQuizSchema = z.object({
  courseId: z.string().min(1, "Select a course"),
  title: z.string().min(3, "Title is required").max(150),
  durationMinutes: z.number().min(1, "Duration must be at least 1 minute"),
  questions: z
    .array(
      z.object({
        questionText: z.string().min(1, "Question text is required"),
        options: z.array(z.string().min(1)).min(2, "At least 2 options required"),
        correctOptionIndex: z.number().min(0),
        marks: z.number().min(1),
      })
    )
    .min(1, "Add at least one question"),
  isPublished: z.boolean().optional(),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;

export const createLiveClassSchema = z.object({
  courseId: z.string().min(1, "Select a course"),
  title: z.string().min(3, "Title is required").max(150),
  platform: z.enum(["zoom", "google-meet"]),
  joinUrl: z.string().url("Enter a valid meeting URL"),
  scheduledAt: z.string().min(1, "Schedule date/time is required"),
  durationMinutes: z.number().min(5, "Duration must be at least 5 minutes"),
});

export type CreateLiveClassInput = z.infer<typeof createLiveClassSchema>;

export const createNoteSchema = z.object({
  courseId: z.string().min(1, "Select a course"),
  title: z.string().min(2, "Title is required").max(150),
  fileUrl: z.string().min(1, "Upload a file"),
  fileType: z.string().min(1),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
