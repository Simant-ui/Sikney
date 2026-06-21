"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/shared/password-input";
import { OtpInput } from "@/components/shared/otp-input";
import { forgotPasswordSchema } from "@/lib/validations";
import { z } from "zod";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";

type Step = "email" | "reset" | "done";

const emailFormSchema = forgotPasswordSchema;
type EmailFormInput = z.infer<typeof emailFormSchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormInput>({ resolver: zodResolver(emailFormSchema) });

  async function onSendCode(data: EmailFormInput) {
    setIsSubmitting(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setEmail(data.email);
      toast.success("If that email exists, a code has been sent.");
      setStep("reset");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onResetPassword() {
    setError("");
    if (code.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password, confirmPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not reset password");
        return;
      }
      setStep("done");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="glass-strong border-0">
          {step === "email" && (
            <>
              <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <KeyRound className="size-6" />
                </div>
                <CardTitle className="text-2xl">Forgot password?</CardTitle>
                <CardDescription>Enter your email and we&apos;ll send you a reset code.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSendCode)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>
                  <Button type="submit" className="w-full brand-gradient-bg border-0 text-white" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    Send reset code
                  </Button>
                </form>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    Log in
                  </Link>
                </p>
              </CardContent>
            </>
          )}

          {step === "reset" && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Enter code & new password</CardTitle>
                <CardDescription>
                  Code sent to <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <OtpInput value={code} onChange={setCode} />
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <PasswordInput
                    id="newPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm new password</Label>
                  <PasswordInput
                    id="confirmNewPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  onClick={onResetPassword}
                  className="w-full brand-gradient-bg border-0 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  Reset password
                </Button>
              </CardContent>
            </>
          )}

          {step === "done" && (
            <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="size-7" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Password reset!</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  You can now log in with your new password.
                </p>
              </div>
              <Button asChild className="w-full brand-gradient-bg border-0 text-white">
                <Link href="/login">Go to login</Link>
              </Button>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
