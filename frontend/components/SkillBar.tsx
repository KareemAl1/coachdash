interface SkillBarProps {
  name: string;
  count: number;
  max: number;
}

// Assign a consistent colour per skill name
const SKILL_COLORS = [
  '#7c5cfc', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316',
];

const colorForSkill = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SKILL_COLORS[Math.abs(hash) % SKILL_COLORS.length];
};

export default function SkillBar({ name, count, max }: SkillBarProps) {
  const pct = Math.round((count / max) * 100);
  const color = colorForSkill(name);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-text-primary font-medium">{name}</span>
        <span className="text-xs text-text-muted">{count}×</span>
      </div>
      <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
