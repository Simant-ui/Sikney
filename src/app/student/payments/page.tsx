"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentItem {
  courseId: string;
  courseTitle: string;
  amount: number;
  status: "paid" | "unpaid";
  invoiceUrl?: string;
}

async function fetchPayments(): Promise<PaymentItem[]> {
  const res = await fetch("/api/student/payments");
  if (!res.ok) throw new Error("Failed to load payments");
  return res.json();
}

export default function StudentPaymentsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["student-payments"], queryFn: fetchPayments });

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
            <Wallet className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No paid courses to show.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {data.map((p) => (
        <Card key={p.courseId} className="glass border-0">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <h3 className="font-semibold">{p.courseTitle}</h3>
              <p className="text-sm text-muted-foreground">NPR {p.amount.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={p.status === "paid" ? "default" : "destructive"} className="capitalize">
                {p.status}
              </Badge>
              {p.status === "paid" ? (
                p.invoiceUrl && (
                  <a href={p.invoiceUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                    View receipt
                  </a>
                )
              ) : (
                <Button
                  size="sm"
                  onClick={() => toast.info("Online payment isn't set up yet — contact admin to pay.")}
                  className="brand-gradient-bg border-0 text-white"
                >
                  Pay Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
