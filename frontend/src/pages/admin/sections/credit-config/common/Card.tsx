function Card({ title, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-glass-card rounded-2xl p-6 border border-subtle flex flex-col justify-center transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
      </div>
      {subtitle && (
        <p className="text-on-surface-variant text-sm mt-2">{subtitle}</p>
      )}
    </div>
  );
}

export default Card;
