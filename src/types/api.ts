// Mirrors the /api/mobile contract served by ClientFlow.
// Kept as plain string unions so the app has no dependency on the server's
// Prisma types.

export type ClientStatus = "PROSPECT" | "ACTIVE" | "AT_RISK" | "INACTIVE";
export type DealStage = "QUALIFIED" | "DISCOVERY" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type ActivityType = "CLIENT_CREATED" | "DEAL_UPDATED" | "TASK_CREATED" | "NOTE";

export type User = { id: string; name: string; email: string; avatarUrl: string | null };
export type Workspace = { id: string; name: string; slug: string };
export type AuthResponse = { token: string; user: User; workspace: Workspace };
export type SessionResponse = { user: User; workspace: Workspace };

export type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
};

export type ClientSummary = {
  id: string;
  name: string;
  status: ClientStatus;
  industry: string | null;
  website: string | null;
  estimatedValue: number;
  pipelineValue: number;
  openDeals: number;
  openTasks: number;
  primaryContact: Contact | null;
  updatedAt: string;
};

export type DealSummary = {
  id: string;
  title: string;
  stage: DealStage;
  value: number;
  probability: number;
  weightedValue: number;
  expectedCloseDate: string | null;
  clientId: string;
  clientName: string;
  updatedAt: string;
};

export type TaskSummary = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  clientId: string | null;
  clientName: string | null;
  dealId: string | null;
  dealTitle: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  updatedAt: string;
};

export type Activity = {
  id: string;
  type: ActivityType;
  message: string;
  actor: string | null;
  createdAt: string;
};

export type ClientDetail = ClientSummary & {
  contacts: Contact[];
  deals: DealSummary[];
  tasks: TaskSummary[];
  activities: Activity[];
};

export type Dashboard = {
  workspace: { name: string };
  metrics: {
    pipelineValue: number;
    weightedPipelineValue: number;
    openDeals: number;
    activeClients: number;
    newClientsThisWeek: number;
    openTasks: number;
    dueToday: number;
    winConfidence: number;
    hotDeals: number;
  };
  pipeline: DealSummary[];
  tasks: TaskSummary[];
  activity: Activity[];
  subscription: { plan: string; status: string } | null;
};

export type Reports = {
  headline: { accounts: number; openPipeline: number; weightedForecast: number };
  metrics: {
    openPipeline: number;
    openDeals: number;
    weightedForecast: number;
    activeRate: number;
    nextThirtyDayValue: number;
    dueSoonTasks: number;
    portfolioValue: number;
    taskCompletionRate: number;
    atRiskClients: number;
  };
  stages: {
    stage: DealStage;
    count: number;
    totalValue: number;
    weightedValue: number;
    averageProbability: number;
  }[];
  clientHealth: { status: ClientStatus; count: number }[];
  taskBreakdown: { status: TaskStatus; count: number }[];
};

export type BillingPlan = {
  key: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  current: boolean;
};

export type Billing = {
  plan: string;
  planName: string;
  price: number;
  status: string;
  renewalDate: string;
  daysRemaining: number;
  pipelineValue: number;
  paymentMode: string;
  stripeConfigured: boolean;
  usage: { label: string; value: number; limit: number; percent: number }[];
  plans: BillingPlan[];
  members: { name: string; email: string; role: string }[];
  history: { id: string; label: string; amount: number; date: string; status: string }[];
};

export type ApiErrorBody = {
  error: { message: string; fields?: Record<string, string> };
};
