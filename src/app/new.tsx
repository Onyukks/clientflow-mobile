import { useState } from "react";
import {
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
import { ApiError } from "@/lib/api";
import { useClients, useCreateClient, useCreateDeal, useCreateTask } from "@/lib/queries";
import { Field, PrimaryButton } from "@/components/ui";
import { ChipSelect, type ChipOption } from "@/components/chips";
import { colors, radius, spacing } from "@/theme";

type EntityType = "task" | "client" | "deal";

const TYPE_OPTIONS: ChipOption[] = [
  { value: "task", label: "Task" },
  { value: "client", label: "Client" },
  { value: "deal", label: "Deal" },
];

const PRIORITIES: ChipOption[] = [{ value: "LOW" }, { value: "MEDIUM" }, { value: "HIGH" }];
const STAGES: ChipOption[] = [
  { value: "QUALIFIED" },
  { value: "DISCOVERY" },
  { value: "PROPOSAL" },
  { value: "NEGOTIATION" },
];
const STATUSES: ChipOption[] = [{ value: "PROSPECT" }, { value: "ACTIVE" }, { value: "AT_RISK" }];

export default function NewEntityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const initialType: EntityType =
    params.type === "client" || params.type === "deal" ? params.type : "task";

  const [type, setType] = useState<EntityType>(initialType);
  const [form, setForm] = useState<Record<string, string>>({ priority: "MEDIUM", stage: "QUALIFIED", status: "PROSPECT" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const clientsQuery = useClients();
  const createTask = useCreateTask();
  const createClient = useCreateClient();
  const createDeal = useCreateDeal();
  const submitting = createTask.isPending || createClient.isPending || createDeal.isPending;

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
        await createTask.mutateAsync({
          title: form.title,
          description: form.description,
          priority: form.priority,
          dueDate: form.dueDate,
          clientId: form.clientId,
        });
      } else if (type === "client") {
        await createClient.mutateAsync({
          name: form.name,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          industry: form.industry,
          estimatedValue: form.estimatedValue,
          status: form.status,
        });
      } else {
        await createDeal.mutateAsync({
          title: form.title,
          clientId: form.clientId,
          stage: form.stage,
          value: form.value,
          probability: form.probability,
          expectedCloseDate: form.expectedCloseDate,
        });
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>New</Text>
        <View style={{ width: 56 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ChipSelect options={TYPE_OPTIONS} value={type} onChange={switchType} />

          {message ? <Text style={styles.message}>{message}</Text> : null}

          {type === "task" ? (
            <>
              <Field label="Title" value={form.title ?? ""} onChangeText={set("title")} error={errors.title} placeholder="Follow up with…" />
              <Field label="Description" value={form.description ?? ""} onChangeText={set("description")} placeholder="Optional notes" multiline />
              <ChipSelect label="Priority" options={PRIORITIES} value={form.priority} onChange={set("priority")} />
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
            </>
          ) : null}

          <View style={{ marginTop: spacing.sm }}>
            <PrimaryButton title="Create" onPress={handleSubmit} loading={submitting} />
          </View>
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
  title: { fontSize: 17, fontWeight: "700", color: colors.text },
  scroll: { padding: spacing.lg },
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
