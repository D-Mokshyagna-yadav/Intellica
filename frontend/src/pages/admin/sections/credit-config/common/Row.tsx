function Row({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-subtle/50 last:border-0 hover:bg-surface-bright/20 px-3 -mx-3 rounded-lg transition-colors">
      <div className="text-sm font-medium text-on-surface">{label}</div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 bg-surface-container-low border border-subtle text-on-surface rounded-lg px-3 py-1.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-mono text-center"
        min={0}
      />
    </div>
  );
}

export default Row;
