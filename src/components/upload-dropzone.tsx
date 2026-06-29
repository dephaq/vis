"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function UploadDropzone({ projectId }: { projectId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("Idle");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setStatus("Uploading");

    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      await fetch(`/api/projects/${projectId}/uploads`, { method: "POST", body });
    }

    setStatus("Uploaded");
    inputRef.current!.value = "";
    router.refresh();
  }

  return (
    <section className="rounded-md border border-stone-300 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-950">Upload files</h2>
      <p className="mt-1 text-sm text-stone-600">DOCX, PDF, images, and DWG attachments are saved locally.</p>
      <label
        className="mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-stone-400 bg-stone-50 px-4 py-6 text-center transition hover:border-blue-600 hover:bg-blue-50"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void upload(event.dataTransfer.files);
        }}
      >
        <span className="text-sm font-medium text-stone-900">Drop files or choose from disk</span>
        <span className="mt-1 text-xs text-stone-500">{status}</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          accept=".docx,.pdf,.dwg,image/*,.txt"
          onChange={(event) => void upload(event.currentTarget.files)}
        />
      </label>
    </section>
  );
}
