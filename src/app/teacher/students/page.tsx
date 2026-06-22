"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentItem {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  courses: string[];
}

async function fetchStudents(): Promise<StudentItem[]> {
  const res = await fetch("/api/teacher/students");
  if (!res.ok) throw new Error("Failed to load students");
  return res.json();
}

export default function TeacherStudentsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["teacher-students"], queryFn: fetchStudents });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <Card className="glass-strong border-0">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No students enrolled in your courses yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {data.map((s) => (
        <Card key={s._id} className="glass border-0">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={s.avatarUrl} />
                <AvatarFallback>{s.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{s.fullName}</h3>
                <p className="text-xs text-muted-foreground">{s.email}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.courses.map((c) => (
                    <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={`/teacher/messages?to=${s._id}`}>
                <MessageSquare className="size-3.5" /> Message
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
