interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  highlight?: boolean;
}

export default function StatCard({ label, value, icon, trend, highlight }: StatCardProps) {
  return (
    <div
      className={`bg-bg-card border rounded-xl p-4 transition-all ${
        highlight
          ? 'border-accent/40 bg-accent-muted/20'
          : 'border-bg-border hover:border-bg-elevated'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xl">{icon}</span>
        {trend && (
          <span className="text-xs text-green-400 font-medium bg-green-400/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${highlight ? 'text-accent' : 'text-text-primary'}`}>
        {value}
      </p>
      <p className="text-text-muted text-xs mt-1">{label}</p>
    </div>
  );
}
