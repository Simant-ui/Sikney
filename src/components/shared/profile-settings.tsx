"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PasswordInput } from "@/components/shared/password-input";
import { Skeleton } from "@/components/ui/skeleton";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations";
import { z } from "zod";

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl?: string;
  bio: string;
  notificationPrefs: { email: boolean; push: boolean; sms: boolean };
}

type ProfileFormInput = z.infer<typeof updateProfileSchema>;
type PasswordFormInput = z.infer<typeof changePasswordSchema>;

async function fetchProfile(): Promise<ProfileData> {
  const res = await fetch("/api/profile");
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

export function ProfileSettings() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const profileForm = useForm<ProfileFormInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: "", phone: "", bio: "" },
  });

  const passwordForm = useForm<PasswordFormInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (data) {
      profileForm.reset({ fullName: data.fullName, phone: data.phone, bio: data.bio });
    }
  }, [data, profileForm]);

  async function onSaveProfile(values: ProfileFormInput) {
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not save profile");
        return;
      }
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function onChangePassword(values: PasswordFormInput) {
    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not change password");
        return;
      }
      toast.success("Password changed");
      passwordForm.reset();
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function onAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not upload avatar");
        return;
      }
      toast.success("Profile picture updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function onTogglePref(key: "email" | "push" | "sms", value: boolean) {
    const res = await fetch("/api/profile/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    if (!res.ok) {
      toast.error("Could not update preference");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const initials = (data?.fullName ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="glass-strong border-0">
        <CardHeader>
          <CardTitle>Profile picture</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-20">
            <AvatarImage src={data?.avatarUrl} alt={data?.fullName} />
            <AvatarFallback className="bg-primary/10 text-xl text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarSelected}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              Change photo
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">JPG or PNG, square images work best.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-strong border-0">
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>{data?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...profileForm.register("fullName")} />
              {profileForm.formState.errors.fullName && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...profileForm.register("phone")} />
              {profileForm.formState.errors.phone && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.phone.message}</p>
              )}
            </div>
            {data?.role !== "admin" && (
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={3} {...profileForm.register("bio")} />
              </div>
            )}
            <Button type="submit" disabled={isSavingProfile} className="brand-gradient-bg border-0 text-white">
              {isSavingProfile && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-strong border-0">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <PasswordInput id="currentPassword" {...passwordForm.register("currentPassword")} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <PasswordInput id="newPassword" {...passwordForm.register("newPassword")} />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm</Label>
                <PasswordInput id="confirmPassword" {...passwordForm.register("confirmPassword")} />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={isSavingPassword} className="brand-gradient-bg border-0 text-white">
              {isSavingPassword && <Loader2 className="size-4 animate-spin" />}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-strong border-0">
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(["email", "push", "sms"] as const).map((key) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="capitalize">{key} notifications</Label>
              <Switch
                id={key}
                checked={data?.notificationPrefs[key] ?? false}
                onCheckedChange={(checked) => onTogglePref(key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
