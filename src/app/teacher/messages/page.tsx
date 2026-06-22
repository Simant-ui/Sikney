import { Suspense } from "react";
import { MessageThread } from "@/components/shared/message-thread";

export default function TeacherMessagesPage() {
  return (
    <Suspense>
      <MessageThread role="teacher" />
    </Suspense>
  );
}
