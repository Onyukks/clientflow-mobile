import { API_URL } from "@/lib/config";
import type {
  ApiErrorBody,
  AuthResponse,
  Billing,
  ClientDetail,
  ClientSummary,
  Dashboard,
  DealSummary,
  Reports,
  SessionResponse,
  TaskSummary,
} from "@/types/api";

// Module-level token set by the auth provider, injected on every request.
let authToken: string | null = null;
export const setApiToken = (token: string | null): void => {
  authToken = token;
};

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(0, "Network error. Check your connection and try again.");
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const body = data as ApiErrorBody | null;
    throw new ApiError(
      response.status,
      body?.error?.message ?? "Something went wrong. Try again.",
      body?.error?.fields,
    );
  }

  return data as T;
}

export type ClientInput = {
  name?: string;
  status?: string;
  industry?: string;
  website?: string;
  estimatedValue?: number | string;
  contactName?: string;
  contactEmail?: string;
  contactTitle?: string;
};

export type DealInput = {
  title?: string;
  clientId?: string;
  stage?: string;
  value?: number | string;
  probability?: number | string;
  expectedCloseDate?: string;
};

export type TaskInput = {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  clientId?: string;
  dealId?: string;
  assigneeId?: string;
};

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/mobile/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<SessionResponse>("/api/mobile/me"),
  dashboard: () => request<Dashboard>("/api/mobile/dashboard"),

  clients: () => request<{ clients: ClientSummary[] }>("/api/mobile/clients").then((r) => r.clients),
  client: (id: string) => request<ClientDetail>(`/api/mobile/clients/${id}`),
  createClient: (input: ClientInput) =>
    request<ClientSummary>("/api/mobile/clients", { method: "POST", body: JSON.stringify(input) }),
  updateClient: (id: string, input: ClientInput) =>
    request<ClientSummary>(`/api/mobile/clients/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteClient: (id: string) =>
    request<{ id: string }>(`/api/mobile/clients/${id}`, { method: "DELETE" }),

  deals: () => request<{ deals: DealSummary[] }>("/api/mobile/deals").then((r) => r.deals),
  createDeal: (input: DealInput) =>
    request<DealSummary>("/api/mobile/deals", { method: "POST", body: JSON.stringify(input) }),
  updateDeal: (id: string, input: DealInput) =>
    request<DealSummary>(`/api/mobile/deals/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteDeal: (id: string) => request<{ id: string }>(`/api/mobile/deals/${id}`, { method: "DELETE" }),

  tasks: () => request<{ tasks: TaskSummary[] }>("/api/mobile/tasks").then((r) => r.tasks),
  createTask: (input: TaskInput) =>
    request<TaskSummary>("/api/mobile/tasks", { method: "POST", body: JSON.stringify(input) }),
  updateTask: (id: string, input: TaskInput) =>
    request<TaskSummary>(`/api/mobile/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteTask: (id: string) => request<{ id: string }>(`/api/mobile/tasks/${id}`, { method: "DELETE" }),

  reports: () => request<Reports>("/api/mobile/reports"),
  billing: () => request<Billing>("/api/mobile/billing"),
  checkout: (plan: string) =>
    request<{ url: string }>("/api/mobile/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),
};
