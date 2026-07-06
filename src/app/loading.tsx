export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-bronze-400 border-t-transparent" role="status" aria-label="Loading" />
    </div>
  );
}
