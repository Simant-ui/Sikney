import {
  LayoutDashboard,
  BookOpen,
  Video,
  FileText,
  ClipboardCheck,
  ClipboardList,
  BarChart3,
  CalendarCheck,
  MessageSquare,
  Bell,
  Wallet,
  Settings,
  Users,
  GraduationCap,
  ShieldCheck,
  Banknote,
  FileBarChart,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  mobile?: boolean;
}

export const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard, mobile: true },
  { label: "My Courses", href: "/student/courses", icon: BookOpen, mobile: true },
  { label: "Live Classes", href: "/student/live-classes", icon: Video },
  { label: "Recorded Classes", href: "/student/recorded-classes", icon: Video },
  { label: "Notes & PDFs", href: "/student/notes", icon: FileText },
  { label: "Assignments", href: "/student/assignments", icon: ClipboardCheck, mobile: true },
  { label: "Quizzes & Exams", href: "/student/quizzes", icon: ClipboardList },
  { label: "Results", href: "/student/results", icon: BarChart3 },
  { label: "Attendance", href: "/student/attendance", icon: CalendarCheck },
  { label: "Messages", href: "/student/messages", icon: MessageSquare, mobile: true },
  { label: "Notifications", href: "/student/notifications", icon: Bell },
  { label: "Payments", href: "/student/payments", icon: Wallet },
  { label: "Settings", href: "/student/settings", icon: Settings },
];

export const teacherNav: NavItem[] = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard, mobile: true },
  { label: "My Courses", href: "/teacher/courses", icon: BookOpen, mobile: true },
  { label: "Create Course", href: "/teacher/courses/new", icon: PlusCircle },
  { label: "Students", href: "/teacher/students", icon: Users },
  { label: "Live Classes", href: "/teacher/live-classes", icon: Video },
  { label: "Recorded Classes", href: "/teacher/recorded-classes", icon: Video },
  { label: "Notes", href: "/teacher/notes", icon: FileText },
  { label: "Assignments", href: "/teacher/assignments", icon: ClipboardCheck, mobile: true },
  { label: "Quiz Management", href: "/teacher/quizzes", icon: ClipboardList },
  { label: "Results", href: "/teacher/results", icon: BarChart3 },
  { label: "Attendance", href: "/teacher/attendance", icon: CalendarCheck },
  { label: "Messages", href: "/teacher/messages", icon: MessageSquare, mobile: true },
  { label: "Earnings", href: "/teacher/earnings", icon: Banknote },
  { label: "Notifications", href: "/teacher/notifications", icon: Bell },
  { label: "Settings", href: "/teacher/settings", icon: Settings },
];

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, mobile: true },
  { label: "Manage Teachers", href: "/admin/teachers", icon: GraduationCap, mobile: true },
  { label: "Manage Students", href: "/admin/students", icon: Users, mobile: true },
  { label: "Manage Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Manage Payments", href: "/admin/payments", icon: Banknote, mobile: true },
  { label: "Reports", href: "/admin/reports", icon: FileBarChart },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const navByRole = {
  student: studentNav,
  teacher: teacherNav,
  admin: adminNav,
};

export const roleIcon: Record<string, LucideIcon> = {
  student: GraduationCap,
  teacher: Users,
  admin: ShieldCheck,
};
