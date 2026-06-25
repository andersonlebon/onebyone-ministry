export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#6E9277]/30 border-t-[#6E9277] rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
      </div>
    </div>
  );
}
