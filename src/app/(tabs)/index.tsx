import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { useDashboard, useUpdateTask } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import { formatCompactMoney, formatDueLabel, formatMoney } from "@/lib/format";
import { Badge, Card, StateView } from "@/components/ui";
import { colors, priorityTone, radius, spacing, stageTone } from "@/theme";
import type { TaskSummary } from "@/types/api";

const greeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

function Metric({ label, value, note, accent }: { label: string; value: string; note: string; accent: string }) {
  return (
    <Card style={styles.metric}>
      <View style={[styles.metricAccent, { backgroundColor: accent }]} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricNote}>{note}</Text>
    </Card>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user, workspace, signOut } = useAuth();
  const { data, isLoading, error, refetch, isRefetching } = useDashboard();
  const updateTask = useUpdateTask();

  const toggleTask = (task: TaskSummary) => {
    updateTask.mutate({ id: task.id, input: { status: task.status === "DONE" ? "TODO" : "DONE" } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {user?.name ?? workspace?.name ?? "ClientFlow"}
          </Text>
        </View>
        <Pressable style={styles.iconButton} onPress={() => router.push("/new")} hitSlop={8}>
          <Ionicons name="add" size={22} color={colors.primary} />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={signOut} hitSlop={8}>
          <Ionicons name="log-out-outline" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <StateView
          loading={isLoading}
          error={error ? (error instanceof ApiError ? error.message : "Failed to load.") : null}
          onRetry={refetch}
        >
          {data ? (
            <>
              <View style={styles.metricGrid}>
                <Metric
                  label="Pipeline value"
                  value={formatCompactMoney(data.metrics.pipelineValue)}
                  note={`${data.metrics.openDeals} open deals`}
                  accent={colors.success}
                />
                <Metric
                  label="Active clients"
                  value={String(data.metrics.activeClients)}
                  note={`+${data.metrics.newClientsThisWeek} this week`}
                  accent={colors.primary}
                />
                <Metric
                  label="Open tasks"
                  value={String(data.metrics.openTasks)}
                  note={`${data.metrics.dueToday} due today`}
                  accent={colors.warning}
                />
                <Metric
                  label="Win confidence"
                  value={`${data.metrics.winConfidence}%`}
                  note={`${data.metrics.hotDeals} hot deals`}
                  accent={colors.danger}
                />
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pipeline</Text>
                <Pressable onPress={() => router.push("/(tabs)/deals")}>
                  <Text style={styles.sectionLink}>See all</Text>
                </Pressable>
              </View>
              <Card style={styles.listCard}>
                {data.pipeline.length === 0 ? (
                  <Text style={styles.emptyRow}>No open deals.</Text>
                ) : (
                  data.pipeline.map((deal, index) => (
                    <View
                      key={deal.id}
                      style={[styles.row, index < data.pipeline.length - 1 && styles.rowDivider]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {deal.title}
                        </Text>
                        <Text style={styles.rowSub} numberOfLines={1}>
                          {deal.clientName} · {deal.probability}%
                        </Text>
                      </View>
                      <View style={styles.rowRight}>
                        <Text style={styles.rowValue}>{formatMoney(deal.value)}</Text>
                        <Badge tone={stageTone[deal.stage]} label={deal.stage} />
                      </View>
                    </View>
                  ))
                )}
              </Card>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tasks</Text>
                <Pressable onPress={() => router.push("/(tabs)/tasks")}>
                  <Text style={styles.sectionLink}>See all</Text>
                </Pressable>
              </View>
              <Card style={styles.listCard}>
                {data.tasks.length === 0 ? (
                  <Text style={styles.emptyRow}>No tasks yet.</Text>
                ) : (
                  data.tasks.map((task, index) => (
                    <View
                      key={task.id}
                      style={[styles.row, index < data.tasks.length - 1 && styles.rowDivider]}
                    >
                      <Pressable onPress={() => toggleTask(task)} hitSlop={8} style={{ marginRight: spacing.md }}>
                        <Ionicons
                          name={task.status === "DONE" ? "checkmark-circle" : "ellipse-outline"}
                          size={24}
                          color={task.status === "DONE" ? colors.success : colors.textFaint}
                        />
                      </Pressable>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.rowTitle, task.status === "DONE" && styles.rowTitleDone]}
                          numberOfLines={1}
                        >
                          {task.title}
                        </Text>
                        <Text style={styles.rowSub} numberOfLines={1}>
                          {task.clientName ?? "Workspace"} · {formatDueLabel(task.dueDate)}
                        </Text>
                      </View>
                      <Badge tone={priorityTone[task.priority]} label={task.priority} />
                    </View>
                  ))
                )}
              </Card>

              <Text style={styles.sectionTitle}>Recent activity</Text>
              <Card style={[styles.listCard, { marginTop: spacing.md }]}>
                {data.activity.length === 0 ? (
                  <Text style={styles.emptyRow}>No activity yet.</Text>
                ) : (
                  data.activity.map((item, index) => (
                    <View
                      key={item.id}
                      style={[styles.activityRow, index < data.activity.length - 1 && styles.rowDivider]}
                    >
                      <View style={styles.activityDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityText}>{item.message}</Text>
                        {item.actor ? <Text style={styles.rowSub}>Updated by {item.actor}</Text> : null}
                      </View>
                    </View>
                  ))
                )}
              </Card>
            </>
          ) : null}
        </StateView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  greeting: { fontSize: 13, color: colors.textMuted },
  name: { fontSize: 22, fontWeight: "800", color: colors.text },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  metric: { width: "47.5%", flexGrow: 1, paddingVertical: spacing.lg, overflow: "hidden" },
  metricAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  metricValue: { fontSize: 24, fontWeight: "800", color: colors.text },
  metricLabel: { fontSize: 13, fontWeight: "600", color: colors.text, marginTop: spacing.xs },
  metricNote: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginTop: spacing.lg },
  sectionLink: { fontSize: 14, fontWeight: "600", color: colors.primary, marginTop: spacing.lg },
  listCard: { padding: 0 },
  row: { flexDirection: "row", alignItems: "center", padding: spacing.lg },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  rowTitleDone: { textDecorationLine: "line-through", color: colors.textFaint },
  rowSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  rowRight: { alignItems: "flex-end", gap: spacing.xs, marginLeft: spacing.md },
  rowValue: { fontSize: 15, fontWeight: "700", color: colors.text },
  emptyRow: { padding: spacing.lg, fontSize: 14, color: colors.textMuted, textAlign: "center" },
  activityRow: { flexDirection: "row", alignItems: "flex-start", padding: spacing.lg, gap: spacing.md },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
  activityText: { fontSize: 14, color: colors.text, lineHeight: 20 },
});
