"use client";

import AdminImageUpload from "@/site/app/components/admin/AdminImageUpload";
import type { MediaFolder } from "@/lib/db/schema";

type AdminMediaSlotFieldProps = {
  label: string;
  value: string;
  folder: MediaFolder;
  saving?: boolean;
  onUploaded: (publicUrl: string) => void;
};

export default function AdminMediaSlotField({
  label,
  value,
  folder,
  saving,
  onUploaded,
}: AdminMediaSlotFieldProps) {
  return (
    <div className="rounded-xl border border-muted p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        {saving && <p className="text-xs font-medium text-[#6E9277]">Saving...</p>}
      </div>

      {value ? (
        <div className="w-full h-32 rounded-xl overflow-hidden bg-muted">
          <img src={value} alt={label} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-32 rounded-xl bg-muted/50 flex items-center justify-center border border-dashed border-muted">
          <p className="text-xs text-muted-foreground">No image uploaded yet</p>
        </div>
      )}

      <AdminImageUpload
        folder={folder}
        label={value ? "Replace image" : "Upload image"}
        onUploaded={({ publicUrl }) => onUploaded(publicUrl)}
      />
    </div>
  );
}
