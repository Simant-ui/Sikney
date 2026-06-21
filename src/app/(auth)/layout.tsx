import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]"
      >
        <div className="absolute left-1/2 top-[-10%] h-[480px] w-[780px] -translate-x-1/2 rounded-full brand-gradient-bg opacity-25 blur-3xl" />
      </div>

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <Link href="/" className="mb-6 flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl brand-gradient-bg text-white shadow-lg">
          <GraduationCap className="size-5" />
        </div>
        <span className="text-xl font-bold">Sikney</span>
      </Link>

      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
