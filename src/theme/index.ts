// Design tokens for the ClientFlow companion app. Light theme that mirrors
// the ClientFlow web dashboard (blue primary, emerald/amber/rose accents).

export const colors = {
  bg: "#F5F7FB",
  surface: "#FFFFFF",
  surfaceAlt: "#FAFBFD",
  border: "#E6EAF1",
  text: "#0F172A",
  textMuted: "#64748B",
  textFaint: "#94A3B8",
  primary: "#208AEF",
  primarySoft: "#E8F1FE",
  success: "#059669",
  successSoft: "#ECFDF5",
  warning: "#B45309",
  warningSoft: "#FFFBEB",
  danger: "#E11D48",
  dangerSoft: "#FFF1F2",
  slate: "#475569",
  slateSoft: "#F1F5F9",
  white: "#FFFFFF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export type Tone = { bg: string; fg: string };

const tone = (bg: string, fg: string): Tone => ({ bg, fg });

export const statusTone: Record<string, Tone> = {
  ACTIVE: tone(colors.successSoft, colors.success),
  PROSPECT: tone(colors.primarySoft, colors.primary),
  AT_RISK: tone(colors.dangerSoft, colors.danger),
  INACTIVE: tone(colors.slateSoft, colors.slate),
};

export const stageTone: Record<string, Tone> = {
  QUALIFIED: tone(colors.dangerSoft, colors.danger),
  DISCOVERY: tone(colors.warningSoft, colors.warning),
  PROPOSAL: tone(colors.primarySoft, colors.primary),
  NEGOTIATION: tone(colors.successSoft, colors.success),
  WON: tone(colors.successSoft, colors.success),
  LOST: tone(colors.slateSoft, colors.slate),
};

export const priorityTone: Record<string, Tone> = {
  HIGH: tone(colors.dangerSoft, colors.danger),
  MEDIUM: tone(colors.warningSoft, colors.warning),
  LOW: tone(colors.slateSoft, colors.slate),
};

export const taskStatusTone: Record<string, Tone> = {
  TODO: tone(colors.primarySoft, colors.primary),
  IN_PROGRESS: tone(colors.warningSoft, colors.warning),
  DONE: tone(colors.successSoft, colors.success),
};

// Turns an enum value like "IN_PROGRESS" into "In progress".
export const labelize = (value: string): string =>
  value
    .toLowerCase()
    .split("_")
    .map((part, index) => (index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ");
