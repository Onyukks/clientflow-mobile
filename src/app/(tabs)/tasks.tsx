import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTasks, useUpdateTask } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import { formatDueLabel, isOverdue } from "@/lib/format";
import { Badge, Card, StateView } from "@/components/ui";
import { GradientHeader } from "@/components/gradient-header";
import { colors, priorityTone, spacing } from "@/theme";
import type { TaskSummary } from "@/types/api";

export default function TasksScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useTasks();
  const updateTask = useUpdateTask();
  const openCount = data?.filter((task) => task.status !== "DONE").length ?? 0;

  const toggle = (task: TaskSummary) => {
    updateTask.mutate({ id: task.id, input: { status: task.status === "DONE" ? "TODO" : "DONE" } });
  };

  return (
    <View style={styles.safe}>
      <GradientHeader
        eyebrow="Follow-ups"
        title="Tasks"
        subtitle={data ? `${openCount} open` : undefined}
        gradient="sky"
        actions={[{ icon: "add", onPress: () => router.push("/new?type=task") }]}
      />
      <StateView
        loading={isLoading}
        error={error ? (error instanceof ApiError ? error.message : "Failed to load.") : null}
        empty={data?.length === 0}
        emptyText="No tasks yet. Tap + to add one."
        onRetry={refetch}
      >
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={({ item }) => {
            const done = item.status === "DONE";
            const overdue = !done && isOverdue(item.dueDate);
            return (
              <Pressable onPress={() => router.push(`/new?type=task&id=${item.id}`)}>
                <Card style={styles.card}>
                  <Pressable onPress={() => toggle(item)} hitSlop={8} style={{ marginRight: spacing.md }}>
                    <Ionicons
                      name={done ? "checkmark-circle" : "ellipse-outline"}
                      size={26}
                      color={done ? colors.success : colors.textFaint}
                    />
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.title, done && styles.titleDone]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.sub} numberOfLines={1}>
                      {item.clientName ?? "Workspace"}
                      {item.assigneeName ? ` · ${item.assigneeName}` : ""}
                    </Text>
                  </View>
                  <View style={styles.right}>
                    <Badge tone={priorityTone[item.priority]} label={item.priority} />
                    <Text style={[styles.due, overdue && styles.dueOverdue]}>{formatDueLabel(item.dueDate)}</Text>
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />
      </StateView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, gap: spacing.md },
  card: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 15, fontWeight: "600", color: colors.text },
  titleDone: { textDecorationLine: "line-through", color: colors.textFaint },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  right: { alignItems: "flex-end", gap: spacing.xs, marginLeft: spacing.sm },
  due: { fontSize: 12, color: colors.textMuted },
  dueOverdue: { color: colors.danger, fontWeight: "600" },
});
