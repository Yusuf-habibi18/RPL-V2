/** Kerangka saat halaman memuat data. */
export default function Memuat() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Memuat data">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-soft" />
        <div className="h-7 w-64 rounded-lg bg-soft" />
        <div className="h-4 w-96 max-w-full rounded bg-soft" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="panel h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel h-72 rounded-2xl lg:col-span-2" />
        <div className="panel h-72 rounded-2xl" />
      </div>
    </div>
  );
}
