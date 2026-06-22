"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/shared/password-input";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAs, setLoginAs] = useState<"student" | "teacher" | "admin">("student");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("sikney:lastEmail");
    if (savedEmail) setValue("email", savedEmail);
  }, [setValue]);

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);

    if (data.rememberMe) {
      localStorage.setItem("sikney:lastEmail", data.email);
    } else {
      localStorage.removeItem("sikney:lastEmail");
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      if (result.code === "EMAIL_NOT_VERIFIED") {
        toast.error("Please verify your email first.");
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        return;
      }
      if (result.code === "ACCOUNT_BLOCKED") {
        toast.error("Your account has been blocked. Contact support.");
        return;
      }
      if (result.code === "TEACHER_PENDING_APPROVAL") {
        toast.error("Your teacher account is pending admin approval.");
        return;
      }
      toast.error("Invalid email or password.");
      return;
    }

    toast.success("Welcome back!");
    router.push(searchParams.get("callbackUrl") ?? "/redirect");
    router.refresh();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="glass-strong border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Log in to continue learning and teaching.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {(["student", "teacher", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setLoginAs(r)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    loginAs === r
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" autoComplete="current-password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  defaultChecked
                  onCheckedChange={(checked) => setValue("rememberMe", checked === true)}
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full brand-gradient-bg border-0 text-white" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href={`/signup?role=${loginAs}`} className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
