import "./ProgressBar.css";

interface ProgressBarProps {
  percentComplete: number;
}

export function ProgressBar({ percentComplete }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percentComplete));

  return (
    <div className="progress-bar-track">
      <div className="progress-bar-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}
