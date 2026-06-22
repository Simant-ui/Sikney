import { Suspense } from "react";
import { MessageThread } from "@/components/shared/message-thread";

export default function StudentMessagesPage() {
  return (
    <Suspense>
      <MessageThread role="student" />
    </Suspense>
  );
}
