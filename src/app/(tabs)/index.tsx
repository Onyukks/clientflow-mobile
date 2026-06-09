import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { useDashboard, useUpdateTask } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import { formatCompactMoney, formatDueLabel, formatMoney } from "@/lib/format";
import { Badge, Card, StateView } from "@/components/ui";
import { GradientHeader } from "@/components/gradient-header";
import { colors, gradients, priorityTone, radius, spacing, stageTone, type GradientKey } from "@/theme";
import type { TaskSummary } from "@/types/api";

const greeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

function StatTile({
  icon,
  value,
  label,
  note,
  gradient,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  note: string;
  gradient: GradientKey;
}) {
  return (
    <LinearGradient
      colors={gradients[gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.tile}
    >
      <View style={styles.tileIcon}>
        <Ionicons name={icon} size={16} color={colors.white} />
      </View>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileNote}>{note}</Text>
    </LinearGradient>
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
    <View style={styles.safe}>
      <GradientHeader
        eyebrow={greeting()}
        title={user?.name ?? workspace?.name ?? "ClientFlow"}
        subtitle={workspace?.name}
        actions={[
          { icon: "card-outline", onPress: () => router.push("/billing") },
          { icon: "add", onPress: () => router.push("/new") },
          { icon: "log-out-outline", onPress: signOut },
        ]}
      />

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
              <View style={styles.tileGrid}>
                <StatTile
                  icon="cash-outline"
                  value={formatCompactMoney(data.metrics.pipelineValue)}
                  label="Pipeline value"
                  note={`${data.metrics.openDeals} open deals`}
                  gradient="emerald"
                />
                <StatTile
                  icon="people-outline"
                  value={String(data.metrics.activeClients)}
                  label="Active clients"
                  note={`+${data.metrics.newClientsThisWeek} this week`}
                  gradient="indigo"
                />
                <StatTile
                  icon="checkbox-outline"
                  value={String(data.metrics.openTasks)}
                  label="Open tasks"
                  note={`${data.metrics.dueToday} due today`}
                  gradient="amber"
                />
                <StatTile
                  icon="flame-outline"
                  value={`${data.metrics.winConfidence}%`}
                  label="Win confidence"
                  note={`${data.metrics.hotDeals} hot deals`}
                  gradient="rose"
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
                <Text style={styles.sectionTitle}>Today&apos;s tasks</Text>
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

              <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Recent activity</Text>
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
              <View style={{ height: spacing.xl }} />
            </>
          ) : null}
        </StateView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingTop: 0 },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: -spacing.xl },
  tile: {
    width: "47.5%",
    flexGrow: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: "#1E293B",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  tileIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  tileValue: { fontSize: 24, fontWeight: "800", color: colors.white },
  tileLabel: { fontSize: 13, fontWeight: "700", color: colors.white, marginTop: spacing.xs },
  tileNote: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  sectionLink: { fontSize: 14, fontWeight: "600", color: colors.primary },
  listCard: { padding: 0, overflow: "hidden" },
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
