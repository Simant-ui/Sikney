"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { PlusCircle, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface LiveClassItem {
  _id: string;
  title: string;
  courseTitle: string;
  platform: "zoom" | "google-meet";
  joinUrl: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "scheduled" | "live" | "ended" | "cancelled";
}

async function fetchLiveClasses(): Promise<LiveClassItem[]> {
  const res = await fetch("/api/teacher/live-classes");
  if (!res.ok) throw new Error("Failed to load live classes");
  return res.json();
}

const statusVariant: Record<LiveClassItem["status"], "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "outline",
  live: "default",
  ended: "secondary",
  cancelled: "destructive",
};

export default function TeacherLiveClassesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["teacher-live-classes"], queryFn: fetchLiveClasses });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Schedule and manage your live classes.</p>
        <Button asChild className="brand-gradient-bg border-0 text-white">
          <Link href="/teacher/live-classes/new">
            <PlusCircle className="size-4" /> Schedule class
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && data?.length === 0 && (
        <Card className="glass-strong border-0">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Video className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">No live classes scheduled yet.</p>
          </CardContent>
        </Card>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        {data?.map((l) => (
          <Card key={l._id} className="glass border-0">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{l.title}</h3>
                  <Badge variant={statusVariant[l.status]} className="capitalize">{l.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {l.courseTitle} &middot; {format(new Date(l.scheduledAt), "MMM d, yyyy h:mm a")} &middot;{" "}
                  {l.durationMinutes} min
                </p>
              </div>
              <a href={l.joinUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                Open meeting
              </a>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
