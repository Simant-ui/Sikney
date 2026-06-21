"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  label?: string;
}

export function FileUploadField({ value, onChange, folder, accept, label }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (folder) formData.append("folder", folder);

      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Upload failed");
        return;
      }
      onChange(json.url);
      toast.success("File uploaded");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
      {value ? (
        <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm">
          <a href={value} target="_blank" rel="noreferrer" className="flex items-center gap-2 truncate text-primary">
            <Paperclip className="size-4 shrink-0" /> <span className="truncate">{value}</span>
          </a>
          <button type="button" onClick={() => onChange("")} aria-label="Remove file">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={isUploading}>
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
          {label ?? "Attach file"}
        </Button>
      )}
    </div>
  );
}
