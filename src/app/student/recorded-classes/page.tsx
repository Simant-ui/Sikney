"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Video as VideoIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoItem {
  _id: string;
  title: string;
  courseTitle: string;
  url: string;
  createdAt: string;
}

async function fetchVideos(): Promise<VideoItem[]> {
  const res = await fetch("/api/student/recorded-classes");
  if (!res.ok) throw new Error("Failed to load recorded classes");
  return res.json();
}

export default function StudentRecordedClassesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["student-recorded-classes"], queryFn: fetchVideos });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <Card className="glass-strong border-0">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <VideoIcon className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No recorded classes yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 sm:grid-cols-2"
    >
      {data.map((v) => (
        <Card key={v._id} className="glass border-0 overflow-hidden">
          <video controls className="aspect-video w-full bg-black">
            <source src={v.url} />
          </video>
          <CardContent className="p-4">
            <h3 className="font-semibold">{v.title}</h3>
            <p className="text-sm text-muted-foreground">
              {v.courseTitle} &middot; Added {format(new Date(v.createdAt), "MMM d, yyyy")}
            </p>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
