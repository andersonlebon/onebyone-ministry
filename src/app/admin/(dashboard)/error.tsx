"use client";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-xl font-semibold text-foreground">Admin could not load</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The dashboard request failed. This is usually a slow database connection or a stale browser session after setup.
          Reload, or sign in again from the login page.
        </p>
        {error.message ? (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error.message}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#6E9277" }}
          >
            Reload
          </button>
          <a
            href="/admin/login"
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-muted text-foreground hover:bg-muted"
          >
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
}
