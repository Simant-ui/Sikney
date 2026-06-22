"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { GraduationCap, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBJECTS } from "@/lib/subjects";

interface TeacherItem {
  _id: string;
  fullName: string;
  avatarUrl?: string;
  subjects: string[];
  courses: { _id: string; title: string; price: number }[];
}

async function fetchTeachers(subject: string): Promise<TeacherItem[]> {
  const res = await fetch(subject ? `/api/student/teachers?subject=${encodeURIComponent(subject)}` : "/api/student/teachers");
  if (!res.ok) throw new Error("Failed to load teachers");
  return res.json();
}

export default function StudentTeachersPage() {
  const [subject, setSubject] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["student-teachers", subject],
    queryFn: () => fetchTeachers(subject),
  });

  return (
    <div className="space-y-6">
      <Card className="glass-strong border-0 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h3 className="font-semibold">Want to teach on Sikney?</h3>
            <p className="text-sm text-muted-foreground">Share your knowledge and earn by teaching students.</p>
          </div>
          <Button asChild className="brand-gradient-bg border-0 text-white">
            <Link href="/signup?role=teacher">Teach with us</Link>
          </Button>
        </CardContent>
      </Card>

      <Select value={subject || "all"} onValueChange={(v) => setSubject(v === "all" ? "" : v)}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Filter by subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All subjects</SelectItem>
          {SUBJECTS.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && data?.length === 0 && (
        <Card className="glass-strong border-0">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">No teachers have signed up yet.</p>
          </CardContent>
        </Card>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-3 sm:grid-cols-2">
        {data?.map((t) => (
          <Card key={t._id} className="glass border-0">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={t.avatarUrl} />
                  <AvatarFallback>{t.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{t.fullName}</h3>
                  {t.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {t.subjects.map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {t.courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No published courses yet.</p>
              ) : (
                <div className="space-y-2">
                  {t.courses.map((c) => (
                    <div key={c._id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{c.title}</p>
                        <Badge variant="outline" className="mt-0.5">
                          {c.price > 0 ? `NPR ${c.price.toLocaleString()}` : "Free"}
                        </Badge>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/student/messages?to=${t._id}&courseId=${c._id}`}>
                          <MessageSquare className="size-3.5" /> Contact
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
