"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ImagePlus, Loader2 } from "lucide-react";

import type { MediaFolder } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/client";
import { uploadToMediaBucket } from "@/lib/supabase/storage";

type AdminImageUploadProps = {
  folder: MediaFolder;
  label?: string;
  onUploaded: (result: { publicUrl: string; path: string }) => void;
};

export default function AdminImageUpload({
  folder,
  label = "Upload image",
  onUploaded,
}: AdminImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const supabase = createClient();
      const uploaded = await uploadToMediaBucket(supabase, file, folder);
      onUploaded(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">{label}</label>
      <motion.button
        type="button"
        whileHover={{ scale: uploading ? 1 : 1.02 }}
        whileTap={{ scale: uploading ? 1 : 0.98 }}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed text-sm font-semibold transition-colors disabled:opacity-60 text-[#6E9277] bg-muted/30 hover:bg-muted/50"
        style={{ borderColor: "rgba(110,146,119,0.4)" }}
      >
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        {uploading ? "Uploading..." : "Choose file from computer"}
      </motion.button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <p className="text-xs text-muted-foreground mt-1.5">JPEG, PNG, or WebP up to 10 MB. Stored in Supabase.</p>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
