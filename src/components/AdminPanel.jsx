import React from 'react';

export default function AdminPanel({ open = false, onClose = ()=>{} }) {
  const [subs, setSubs] = React.useState([]);

  React.useEffect(() => {
    if (!open) return;

    // GANTI URL INI dengan URL ngrok kamu
    const API_BASE = "https://sparrowless-jennell-overfaithfully.ngrok-free.dev";

    fetch(`${API_BASE}/api/results`)
      .then(r => r.json())
      .then(data => setSubs(Array.isArray(data) ? data : []))
      .catch(() => {
        // fallback ke localStorage jika server tidak bisa diakses
        try {
          const local = JSON.parse(localStorage.getItem('quiz_submissions') || '[]');
          setSubs(local);
        } catch (e) { setSubs([]); }
      });
  }, [open]);

  const exportCSV = () => {
    const header = ['Nama', 'Asal', 'NoHP', 'Score', 'Level', 'Timestamp'];
    const rows = subs.map(s => [s.name, s.origin, s.phone, s.score, s.level, s.timestamp]);
    const csv = [header, ...rows]
      .map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz_submissions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    // GANTI URL INI dengan URL ngrok kamu juga
    const API_BASE = "https://sparrowless-jennell-overfaithfully.ngrok-free.dev";

    if (!confirm('Hapus semua data di server dan local?')) return;
    fetch(`${API_BASE}/api/results`, { method: 'DELETE' }).catch(() => {});
    localStorage.removeItem('quiz_submissions');
    setSubs([]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Background transparan blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel utama */}
      <div className="relative max-w-3xl w-full bg-slate-900/95 rounded-2xl p-5 shadow-2xl text-white border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Panel Admin - Hasil Quiz</h3>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-sm hover:bg-slate-700 transition"
            >
              Export CSV
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1 rounded bg-red-700/80 text-sm hover:bg-red-600 transition"
            >
              Hapus Semua
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-slate-700 text-sm hover:bg-slate-600 transition"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Isi tabel */}
        <div className="max-h-[60vh] overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
          {subs.length === 0 ? (
            <div className="text-slate-400 text-center py-6">Belum ada data.</div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700 text-left">
                  <th className="p-2">Nama</th>
                  <th className="p-2">Asal</th>
                  <th className="p-2">No HP</th>
                  <th className="p-2">Score</th>
                  <th className="p-2">Level</th>
                  <th className="p-2">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s, idx) => (
                  <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/40">
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.origin}</td>
                    <td className="p-2">{s.phone}</td>
                    <td className="p-2">{s.score}</td>
                    <td className="p-2">{s.level}</td>
                    <td className="p-2">{new Date(s.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
