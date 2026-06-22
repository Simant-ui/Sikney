"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { PlusCircle, Video as VideoIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoItem {
  _id: string;
  title: string;
  courseTitle: string;
  url: string;
  createdAt: string;
}

async function fetchVideos(): Promise<VideoItem[]> {
  const res = await fetch("/api/teacher/recorded-classes");
  if (!res.ok) throw new Error("Failed to load recorded classes");
  return res.json();
}

export default function TeacherRecordedClassesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["teacher-recorded-classes"], queryFn: fetchVideos });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Upload recorded lessons for your courses.</p>
        <Button asChild className="brand-gradient-bg border-0 text-white">
          <Link href="/teacher/recorded-classes/new">
            <PlusCircle className="size-4" /> Upload recording
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
              <VideoIcon className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">No recorded classes yet.</p>
          </CardContent>
        </Card>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        {data?.map((v) => (
          <Card key={v._id} className="glass border-0">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <h3 className="font-semibold">{v.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {v.courseTitle} &middot; Added {format(new Date(v.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <a href={v.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                View video
              </a>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
