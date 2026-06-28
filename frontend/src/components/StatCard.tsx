function StatCard({ title, count }) {
  return (
    <div className="card" style={{ width: 180, textAlign: "center" }}>
      <h4>{title}</h4>
      <h2>{count}</h2>
    </div>
  );
}

export default StatCard;
