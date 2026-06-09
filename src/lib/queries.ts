import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ClientInput, type DealInput, type TaskInput } from "@/lib/api";

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  clients: ["clients"] as const,
  client: (id: string) => ["clients", id] as const,
  deals: ["deals"] as const,
  tasks: ["tasks"] as const,
  reports: ["reports"] as const,
  billing: ["billing"] as const,
};

export const useDashboard = () => useQuery({ queryKey: queryKeys.dashboard, queryFn: api.dashboard });
export const useClients = () => useQuery({ queryKey: queryKeys.clients, queryFn: api.clients });
export const useClient = (id: string) =>
  useQuery({ queryKey: queryKeys.client(id), queryFn: () => api.client(id), enabled: Boolean(id) });
export const useDeals = () => useQuery({ queryKey: queryKeys.deals, queryFn: api.deals });
export const useTasks = () => useQuery({ queryKey: queryKeys.tasks, queryFn: api.tasks });
export const useReports = () => useQuery({ queryKey: queryKeys.reports, queryFn: api.reports });
export const useBilling = () => useQuery({ queryKey: queryKeys.billing, queryFn: api.billing });
export const useCheckout = () => useMutation({ mutationFn: (plan: string) => api.checkout(plan) });

// A write to any entity can shift dashboard/report/billing metrics, so refresh broadly.
const useInvalidateAll = () => {
  const client = useQueryClient();
  return () => {
    client.invalidateQueries({ queryKey: queryKeys.dashboard });
    client.invalidateQueries({ queryKey: queryKeys.clients });
    client.invalidateQueries({ queryKey: queryKeys.deals });
    client.invalidateQueries({ queryKey: queryKeys.tasks });
    client.invalidateQueries({ queryKey: queryKeys.reports });
    client.invalidateQueries({ queryKey: queryKeys.billing });
  };
};

export const useCreateClient = () => {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: (input: ClientInput) => api.createClient(input), onSuccess: invalidate });
};

export const useUpdateClient = () => {
  const client = useQueryClient();
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ClientInput }) => api.updateClient(id, input),
    onSuccess: (result) => {
      invalidate();
      client.invalidateQueries({ queryKey: queryKeys.client(result.id) });
    },
  });
};

export const useDeleteClient = () => {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: (id: string) => api.deleteClient(id), onSuccess: invalidate });
};

export const useCreateDeal = () => {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: (input: DealInput) => api.createDeal(input), onSuccess: invalidate });
};

export const useUpdateDeal = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DealInput }) => api.updateDeal(id, input),
    onSuccess: invalidate,
  });
};

export const useDeleteDeal = () => {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: (id: string) => api.deleteDeal(id), onSuccess: invalidate });
};

export const useCreateTask = () => {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: (input: TaskInput) => api.createTask(input), onSuccess: invalidate });
};

export const useUpdateTask = () => {
  const client = useQueryClient();
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TaskInput }) => api.updateTask(id, input),
    onSuccess: (task) => {
      invalidate();
      if (task.clientId) {
        client.invalidateQueries({ queryKey: queryKeys.client(task.clientId) });
      }
    },
  });
};

export const useDeleteTask = () => {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: (id: string) => api.deleteTask(id), onSuccess: invalidate });
};
