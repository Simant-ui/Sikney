"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TeacherItem {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  status: "pending" | "active" | "blocked";
  createdAt: string;
}

async function fetchTeachers(): Promise<TeacherItem[]> {
  const res = await fetch("/api/admin/teachers");
  if (!res.ok) throw new Error("Failed to load teachers");
  return res.json();
}

const statusVariant: Record<TeacherItem["status"], "default" | "secondary" | "destructive"> = {
  active: "default",
  pending: "secondary",
  blocked: "destructive",
};

export default function AdminTeachersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-teachers"], queryFn: fetchTeachers });

  async function updateStatus(id: string, status: "active" | "blocked" | "pending") {
    const res = await fetch(`/api/admin/teachers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Could not update teacher");
      return;
    }
    toast.success(status === "active" ? "Teacher approved" : "Teacher blocked");
    queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
  }

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
            <GraduationCap className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No teachers have signed up yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {data.map((t) => (
        <Card key={t._id} className="glass border-0">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{t.fullName}</h3>
                <Badge variant={statusVariant[t.status]} className="capitalize">{t.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.email} &middot; {t.phone} &middot; Joined {format(new Date(t.createdAt), "MMM d, yyyy")}
              </p>
            </div>
            <div className="flex gap-2">
              {t.status !== "active" && (
                <Button size="sm" onClick={() => updateStatus(t._id, "active")} className="brand-gradient-bg border-0 text-white">
                  Approve
                </Button>
              )}
              {t.status !== "blocked" && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(t._id, "blocked")}>
                  Block
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
