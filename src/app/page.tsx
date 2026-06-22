import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  GraduationCap,
  BookOpen,
  Video,
  ClipboardCheck,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { LandingHero } from "@/components/shared/landing-hero";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const features = [
  {
    icon: Video,
    title: "Live & Recorded Classes",
    description: "Join Zoom or Google Meet sessions, or catch up anytime with recorded lessons.",
  },
  {
    icon: BookOpen,
    title: "Notes, PDFs & Assignments",
    description: "Download course material and submit assignments straight from your phone.",
  },
  {
    icon: ClipboardCheck,
    title: "Quizzes & Instant Results",
    description: "Timed MCQ quizzes with auto-grading and instant performance analytics.",
  },
  {
    icon: BarChart3,
    title: "Attendance & Analytics",
    description: "Track attendance, scores, and progress with beautiful, clear charts.",
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging",
    description: "Chat directly with your teachers or students, with read receipts and file sharing.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Role-Based",
    description: "Role-based access for students, teachers, and admins with verified accounts.",
  },
];

const roles = [
  {
    title: "Students",
    description: "Browse courses, join live classes, submit assignments, and track your results.",
    href: "/signup?role=student",
  },
  {
    title: "Teachers",
    description: "Create courses, manage students, grade assignments, and view your earnings.",
    href: "/signup?role=teacher",
  },
  {
    title: "Admins",
    description: "Approve teachers, manage the platform, and oversee payments and reports.",
    href: "/login",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      alternateName: ["sikney.com", "sikney.com.np"],
      url: SITE_URL,
      description:
        "Sikney is an online tuition class and knowledge website in Nepal, connecting students with the best teachers near them for live classes, recorded lessons, notes, assignments, and quizzes.",
      areaServed: {
        "@type": "Country",
        name: "Nepal",
      },
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="sticky top-0 z-40 border-b border-border/50 glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl brand-gradient-bg text-white shadow-lg">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-lg font-bold">Sikney</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="brand-gradient-bg text-white border-0">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <LandingHero />

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything a modern tuition class needs</h2>
          <p className="mt-3 text-muted-foreground">
            One platform for live teaching, learning, grading, and growth — built for mobile first.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="glass border-0">
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Built for every role</h2>
          <p className="mt-3 text-muted-foreground">Choose how you want to use Sikney.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.title} className="glass-strong border-0">
              <CardContent className="flex flex-col gap-4 p-6">
                <h3 className="text-xl font-semibold">{role.title}</h3>
                <p className="flex-1 text-sm text-muted-foreground">{role.description}</p>
                <Button asChild variant="outline" className="justify-between">
                  <Link href={role.href}>
                    Continue <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-12 text-center sm:px-6">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Looking for the best tuition class in Nepal?
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Sikney is a knowledge website and online tuition class built for Nepal, helping students
          find the best teacher near me for live classes, recorded lessons, notes, assignments,
          quizzes, and attendance tracking — all from one account at{" "}
          <span className="font-medium text-foreground">sikney.com</span>.
        </p>
      </section>

      <footer className="border-t border-border/50 px-4 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Sikney. All rights reserved.
      </footer>
    </div>
  );
}
