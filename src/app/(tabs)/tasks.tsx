import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTasks, useUpdateTask } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import { formatDueLabel, isOverdue } from "@/lib/format";
import { Badge, Card, StateView } from "@/components/ui";
import { ListHeader } from "@/components/list-header";
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
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ListHeader
        title="Tasks"
        subtitle={data ? `${openCount} open` : undefined}
        onAdd={() => router.push("/new?type=task")}
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
            );
          }}
        />
      </StateView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, paddingTop: spacing.xs, gap: spacing.md },
  card: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 15, fontWeight: "600", color: colors.text },
  titleDone: { textDecorationLine: "line-through", color: colors.textFaint },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  right: { alignItems: "flex-end", gap: spacing.xs, marginLeft: spacing.sm },
  due: { fontSize: 12, color: colors.textMuted },
  dueOverdue: { color: colors.danger, fontWeight: "600" },
});
