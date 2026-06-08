import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ClientInput, type DealInput, type TaskInput } from "@/lib/api";

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  clients: ["clients"] as const,
  client: (id: string) => ["clients", id] as const,
  deals: ["deals"] as const,
  tasks: ["tasks"] as const,
};

export const useDashboard = () => useQuery({ queryKey: queryKeys.dashboard, queryFn: api.dashboard });
export const useClients = () => useQuery({ queryKey: queryKeys.clients, queryFn: api.clients });
export const useClient = (id: string) =>
  useQuery({ queryKey: queryKeys.client(id), queryFn: () => api.client(id), enabled: Boolean(id) });
export const useDeals = () => useQuery({ queryKey: queryKeys.deals, queryFn: api.deals });
export const useTasks = () => useQuery({ queryKey: queryKeys.tasks, queryFn: api.tasks });

// A write to any entity can shift dashboard metrics, so refresh broadly.
const useInvalidateAll = () => {
  const client = useQueryClient();
  return () => {
    client.invalidateQueries({ queryKey: queryKeys.dashboard });
    client.invalidateQueries({ queryKey: queryKeys.clients });
    client.invalidateQueries({ queryKey: queryKeys.deals });
    client.invalidateQueries({ queryKey: queryKeys.tasks });
  };
};

export const useCreateClient = () => {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: (input: ClientInput) => api.createClient(input), onSuccess: invalidate });
};

export const useCreateDeal = () => {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: (input: DealInput) => api.createDeal(input), onSuccess: invalidate });
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
