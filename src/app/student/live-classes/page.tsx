"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface LiveClassItem {
  _id: string;
  title: string;
  courseTitle: string;
  joinUrl: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "scheduled" | "live" | "ended" | "cancelled";
}

async function fetchLiveClasses(): Promise<LiveClassItem[]> {
  const res = await fetch("/api/student/live-classes");
  if (!res.ok) throw new Error("Failed to load live classes");
  return res.json();
}

const statusVariant: Record<LiveClassItem["status"], "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "outline",
  live: "default",
  ended: "secondary",
  cancelled: "destructive",
};

export default function StudentLiveClassesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["student-live-classes"], queryFn: fetchLiveClasses });

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
            <Video className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No live classes scheduled yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {data.map((l) => {
        const canJoin = l.status === "scheduled" || l.status === "live";
        return (
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
              {canJoin ? (
                <Button asChild size="sm" className="brand-gradient-bg border-0 text-white">
                  <a href={l.joinUrl} target="_blank" rel="noreferrer">
                    Join class
                  </a>
                </Button>
              ) : (
                <Button size="sm" disabled className="brand-gradient-bg border-0 text-white">
                  Join class
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </motion.div>
  );
}
