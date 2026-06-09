import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import {
  queryKeys,
  useClients,
  useCreateClient,
  useCreateDeal,
  useCreateTask,
  useDeleteClient,
  useDeleteDeal,
  useDeleteTask,
  useUpdateClient,
  useUpdateDeal,
  useUpdateTask,
} from "@/lib/queries";
import { Field, GradientButton, PrimaryButton } from "@/components/ui";
import { ChipSelect, type ChipOption } from "@/components/chips";
import { colors, radius, spacing } from "@/theme";
import type { ClientSummary, DealSummary, TaskSummary } from "@/types/api";

type EntityType = "task" | "client" | "deal";

const TYPE_OPTIONS: ChipOption[] = [
  { value: "task", label: "Task" },
  { value: "client", label: "Client" },
  { value: "deal", label: "Deal" },
];

const PRIORITIES: ChipOption[] = [{ value: "LOW" }, { value: "MEDIUM" }, { value: "HIGH" }];
const TASK_STATUSES: ChipOption[] = [{ value: "TODO" }, { value: "IN_PROGRESS" }, { value: "DONE" }];
const STAGES: ChipOption[] = [
  { value: "QUALIFIED" },
  { value: "DISCOVERY" },
  { value: "PROPOSAL" },
  { value: "NEGOTIATION" },
];
const STATUSES: ChipOption[] = [{ value: "PROSPECT" }, { value: "ACTIVE" }, { value: "AT_RISK" }];

const toDateInput = (iso: string | null): string => (iso ? iso.slice(0, 10) : "");

export default function EntityFormScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ type?: string; id?: string }>();
  const editId = typeof params.id === "string" ? params.id : undefined;
  const isEditing = Boolean(editId);
  const initialType: EntityType =
    params.type === "client" || params.type === "deal" ? params.type : "task";

  // In edit mode, prefill from the cached list the user came from.
  const initialForm = useMemo<Record<string, string>>(() => {
    const base: Record<string, string> = {
      priority: "MEDIUM",
      stage: "QUALIFIED",
      status: initialType === "task" ? "TODO" : "PROSPECT",
    };
    if (!editId) return base;

    if (initialType === "client") {
      const c = queryClient.getQueryData<ClientSummary[]>(queryKeys.clients)?.find((x) => x.id === editId);
      if (c)
        return {
          name: c.name,
          status: c.status,
          industry: c.industry ?? "",
          website: c.website ?? "",
          estimatedValue: String(c.estimatedValue ?? ""),
          contactName: c.primaryContact?.name ?? "",
          contactEmail: c.primaryContact?.email ?? "",
          contactTitle: c.primaryContact?.title ?? "",
        } satisfies Record<string, string>;
    } else if (initialType === "deal") {
      const d = queryClient.getQueryData<DealSummary[]>(queryKeys.deals)?.find((x) => x.id === editId);
      if (d)
        return {
          title: d.title,
          clientId: d.clientId,
          stage: d.stage,
          value: String(d.value ?? ""),
          probability: String(d.probability ?? ""),
          expectedCloseDate: toDateInput(d.expectedCloseDate),
        } satisfies Record<string, string>;
    } else {
      const t = queryClient.getQueryData<TaskSummary[]>(queryKeys.tasks)?.find((x) => x.id === editId);
      if (t)
        return {
          title: t.title,
          description: t.description ?? "",
          priority: t.priority,
          status: t.status,
          dueDate: toDateInput(t.dueDate),
          clientId: t.clientId ?? "",
        } satisfies Record<string, string>;
    }
    return base;
  }, [editId, initialType, queryClient]);

  const [type, setType] = useState<EntityType>(initialType);
  const [form, setForm] = useState<Record<string, string>>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const clientsQuery = useClients();
  const createTask = useCreateTask();
  const createClient = useCreateClient();
  const createDeal = useCreateDeal();
  const updateTask = useUpdateTask();
  const updateClient = useUpdateClient();
  const updateDeal = useUpdateDeal();
  const deleteTask = useDeleteTask();
  const deleteClient = useDeleteClient();
  const deleteDeal = useDeleteDeal();

  const submitting =
    createTask.isPending ||
    createClient.isPending ||
    createDeal.isPending ||
    updateTask.isPending ||
    updateClient.isPending ||
    updateDeal.isPending;
  const deleting = deleteTask.isPending || deleteClient.isPending || deleteDeal.isPending;

  const set = (key: string) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const clientOptions: ChipOption[] = (clientsQuery.data ?? []).map((c) => ({ value: c.id, label: c.name }));

  const switchType = (next: string) => {
    setType(next as EntityType);
    setErrors({});
    setMessage(null);
  };

  const handleSubmit = async () => {
    setErrors({});
    setMessage(null);

    try {
      if (type === "task") {
        const input = {
          title: form.title,
          description: form.description,
          priority: form.priority,
          status: form.status,
          dueDate: form.dueDate,
          clientId: form.clientId,
        };
        if (editId) await updateTask.mutateAsync({ id: editId, input });
        else await createTask.mutateAsync(input);
      } else if (type === "client") {
        const input = {
          name: form.name,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          contactTitle: form.contactTitle,
          industry: form.industry,
          website: form.website,
          estimatedValue: form.estimatedValue,
          status: form.status,
        };
        if (editId) await updateClient.mutateAsync({ id: editId, input });
        else await createClient.mutateAsync(input);
      } else {
        const input = {
          title: form.title,
          clientId: form.clientId,
          stage: form.stage,
          value: form.value,
          probability: form.probability,
          expectedCloseDate: form.expectedCloseDate,
        };
        if (editId) await updateDeal.mutateAsync({ id: editId, input });
        else await createDeal.mutateAsync(input);
      }
      router.back();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields ?? {});
        setMessage(err.message);
      } else {
        setMessage("Something went wrong. Try again.");
      }
    }
  };

  const handleDelete = () => {
    if (!editId) return;
    Alert.alert(`Delete ${type}?`, "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (type === "task") await deleteTask.mutateAsync(editId);
            else if (type === "client") await deleteClient.mutateAsync(editId);
            else await deleteDeal.mutateAsync(editId);
            router.back();
          } catch {
            setMessage("Could not delete. Try again.");
          }
        },
      },
    ]);
  };

  const titleText = isEditing ? `Edit ${type}` : "New";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>{titleText}</Text>
        <View style={{ width: 56 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!isEditing ? <ChipSelect options={TYPE_OPTIONS} value={type} onChange={switchType} /> : null}

          {message ? <Text style={styles.message}>{message}</Text> : null}

          {type === "task" ? (
            <>
              <Field label="Title" value={form.title ?? ""} onChangeText={set("title")} error={errors.title} placeholder="Follow up with…" />
              <Field label="Description" value={form.description ?? ""} onChangeText={set("description")} placeholder="Optional notes" multiline />
              <ChipSelect label="Priority" options={PRIORITIES} value={form.priority} onChange={set("priority")} />
              <ChipSelect label="Status" options={TASK_STATUSES} value={form.status} onChange={set("status")} scroll />
              <Field label="Due date" value={form.dueDate ?? ""} onChangeText={set("dueDate")} error={errors.dueDate} placeholder="YYYY-MM-DD" autoCapitalize="none" />
              {clientOptions.length > 0 ? (
                <ChipSelect label="Client (optional)" options={clientOptions} value={form.clientId} onChange={set("clientId")} scroll />
              ) : null}
            </>
          ) : null}

          {type === "client" ? (
            <>
              <Field label="Company name" value={form.name ?? ""} onChangeText={set("name")} error={errors.name} placeholder="Acme Inc." />
              <Field label="Primary contact" value={form.contactName ?? ""} onChangeText={set("contactName")} error={errors.contactName} placeholder="Jane Doe" />
              <Field label="Contact email" value={form.contactEmail ?? ""} onChangeText={set("contactEmail")} error={errors.contactEmail} placeholder="jane@acme.com" autoCapitalize="none" keyboardType="email-address" />
              <Field label="Industry" value={form.industry ?? ""} onChangeText={set("industry")} placeholder="SaaS" />
              <Field label="Website" value={form.website ?? ""} onChangeText={set("website")} error={errors.website} placeholder="acme.com" autoCapitalize="none" />
              <Field label="Estimated value" value={form.estimatedValue ?? ""} onChangeText={set("estimatedValue")} error={errors.estimatedValue} placeholder="50000" keyboardType="numeric" />
              <ChipSelect label="Status" options={STATUSES} value={form.status} onChange={set("status")} />
            </>
          ) : null}

          {type === "deal" ? (
            <>
              <Field label="Deal title" value={form.title ?? ""} onChangeText={set("title")} error={errors.title} placeholder="Annual contract" />
              {clientOptions.length > 0 ? (
                <ChipSelect label="Client" options={clientOptions} value={form.clientId} onChange={set("clientId")} scroll />
              ) : (
                <Text style={styles.hint}>Add a client first to attach a deal.</Text>
              )}
              {errors.clientId ? <Text style={styles.fieldError}>{errors.clientId}</Text> : null}
              <Field label="Value" value={form.value ?? ""} onChangeText={set("value")} error={errors.value} placeholder="25000" keyboardType="numeric" />
              <ChipSelect label="Stage" options={STAGES} value={form.stage} onChange={set("stage")} scroll />
              <Field label="Probability (%)" value={form.probability ?? ""} onChangeText={set("probability")} error={errors.probability} placeholder="50" keyboardType="numeric" />
              <Field label="Expected close" value={form.expectedCloseDate ?? ""} onChangeText={set("expectedCloseDate")} error={errors.expectedCloseDate} placeholder="YYYY-MM-DD" autoCapitalize="none" />
            </>
          ) : null}

          <View style={{ marginTop: spacing.sm }}>
            <GradientButton title={isEditing ? "Save changes" : "Create"} onPress={handleSubmit} loading={submitting} />
          </View>

          {isEditing ? (
            <View style={{ marginTop: spacing.md }}>
              <PrimaryButton title={`Delete ${type}`} onPress={handleDelete} loading={deleting} variant="danger" />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancel: { fontSize: 16, color: colors.textMuted, width: 56 },
  title: { fontSize: 17, fontWeight: "700", color: colors.text, textTransform: "capitalize" },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  message: {
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
    padding: spacing.md,
    borderRadius: radius.md,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  hint: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
  fieldError: { color: colors.danger, fontSize: 12, marginTop: -spacing.md, marginBottom: spacing.lg },
});
