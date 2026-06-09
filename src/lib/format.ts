// Hermes (React Native's engine) has limited Intl support, so currency and
// date formatting are done manually to stay consistent across devices.

const withThousands = (value: number): string =>
  Math.abs(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const formatMoney = (value: number): string => {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${withThousands(Math.round(value))}`;
};

export const formatCompactMoney = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }

  return `${sign}$${Math.round(abs)}`;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Relative, human label for a due/close date: Today, Tomorrow, Overdue, or "Mar 5".
export const formatDueLabel = (iso: string | null): string => {
  if (!iso) {
    return "No date";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  const today = startOfDay(new Date()).getTime();
  const due = startOfDay(date).getTime();
  const diffDays = Math.round((due - today) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;

  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
};

export const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const isOverdue = (iso: string | null): boolean => {
  if (!iso) return false;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return startOfDay(date).getTime() < startOfDay(new Date()).getTime();
};

export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
