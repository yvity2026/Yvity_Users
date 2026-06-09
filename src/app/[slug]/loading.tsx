export default function PublicProfileLoading() {
  return (
    <div
      className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6"
      role="status"
      aria-busy="true"
      aria-label="Loading advisor profile"
    >
      <div className="animate-pulse space-y-6">
        <div className="h-56 rounded-3xl bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-32 rounded-2xl bg-white/8" />
          <div className="h-32 rounded-2xl bg-white/8" />
        </div>
        <div className="h-40 rounded-2xl bg-white/8" />
      </div>
      <span className="sr-only">Loading advisor profile</span>
    </div>
  );
}
