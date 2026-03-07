export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 dark:border-cyan-400 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading DropiQ...</p>
      </div>
    </div>
  )
}
