import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useClient, useUpdateTask } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import { formatDueLabel, formatMoney } from "@/lib/format";
import { Avatar, Badge, Card, StateView } from "@/components/ui";
import { colors, labelize, priorityTone, spacing, statusTone, stageTone } from "@/theme";
import type { TaskSummary } from "@/types/api";

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ClientDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, error, refetch, isRefetching } = useClient(id);
  const updateTask = useUpdateTask();

  const toggle = (task: TaskSummary) => {
    updateTask.mutate({ id: task.id, input: { status: task.status === "DONE" ? "TODO" : "DONE" } });
  };

  return (
    <View style={styles.safe}>
      <Stack.Screen
        options={{
          title: data?.name ?? "Client",
          headerRight: () => (
            <Pressable onPress={() => router.push(`/new?type=client&id=${id}`)} hitSlop={8}>
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />
      <StateView
        loading={isLoading}
        error={error ? (error instanceof ApiError ? error.message : "Failed to load.") : null}
        onRetry={refetch}
      >
        {data ? (
          <ScrollView
            contentContainerStyle={styles.scroll}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          >
            <Card style={styles.headerCard}>
              <View style={styles.headerRow}>
                <Avatar name={data.name} size={52} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.name}>{data.name}</Text>
                  <Text style={styles.industry}>{data.industry ?? "General"}</Text>
                </View>
                <Badge tone={statusTone[data.status]} label={labelize(data.status)} />
              </View>
              {data.website ? (
                <Pressable
                  style={styles.websiteRow}
                  onPress={() => Linking.openURL(data.website as string).catch(() => undefined)}
                >
                  <Ionicons name="globe-outline" size={16} color={colors.primary} />
                  <Text style={styles.website} numberOfLines={1}>
                    {data.website.replace(/^https?:\/\//, "")}
                  </Text>
                </Pressable>
              ) : null}
              <View style={styles.statsRow}>
                <SummaryStat label="Pipeline" value={formatMoney(data.pipelineValue)} />
                <SummaryStat label="Est. value" value={formatMoney(data.estimatedValue)} />
                <SummaryStat label="Open deals" value={String(data.openDeals)} />
              </View>
            </Card>

            {data.primaryContact ? (
              <>
                <Text style={styles.section}>Contact</Text>
                <Card>
                  <Text style={styles.contactName}>{data.primaryContact.name}</Text>
                  {data.primaryContact.title ? (
                    <Text style={styles.rowSub}>{data.primaryContact.title}</Text>
                  ) : null}
                  {data.primaryContact.email ? (
                    <Pressable
                      style={styles.contactLink}
                      onPress={() => Linking.openURL(`mailto:${data.primaryContact?.email}`).catch(() => undefined)}
                    >
                      <Ionicons name="mail-outline" size={15} color={colors.primary} />
                      <Text style={styles.contactLinkText}>{data.primaryContact.email}</Text>
                    </Pressable>
                  ) : null}
                  {data.primaryContact.phone ? (
                    <Pressable
                      style={styles.contactLink}
                      onPress={() => Linking.openURL(`tel:${data.primaryContact?.phone}`).catch(() => undefined)}
                    >
                      <Ionicons name="call-outline" size={15} color={colors.primary} />
                      <Text style={styles.contactLinkText}>{data.primaryContact.phone}</Text>
                    </Pressable>
                  ) : null}
                </Card>
              </>
            ) : null}

            <Text style={styles.section}>Deals ({data.deals.length})</Text>
            <Card style={styles.listCard}>
              {data.deals.length === 0 ? (
                <Text style={styles.empty}>No deals for this client.</Text>
              ) : (
                data.deals.map((deal, index) => (
                  <View key={deal.id} style={[styles.row, index < data.deals.length - 1 && styles.divider]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {deal.title}
                      </Text>
                      <Text style={styles.rowSub}>{deal.probability}% likely</Text>
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={styles.rowValue}>{formatMoney(deal.value)}</Text>
                      <Badge tone={stageTone[deal.stage]} label={deal.stage} />
                    </View>
                  </View>
                ))
              )}
            </Card>

            <Text style={styles.section}>Tasks ({data.tasks.length})</Text>
            <Card style={styles.listCard}>
              {data.tasks.length === 0 ? (
                <Text style={styles.empty}>No tasks for this client.</Text>
              ) : (
                data.tasks.map((task, index) => (
                  <View key={task.id} style={[styles.row, index < data.tasks.length - 1 && styles.divider]}>
                    <Pressable onPress={() => toggle(task)} hitSlop={8} style={{ marginRight: spacing.md }}>
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
                      <Text style={styles.rowSub}>{formatDueLabel(task.dueDate)}</Text>
                    </View>
                    <Badge tone={priorityTone[task.priority]} label={task.priority} />
                  </View>
                ))
              )}
            </Card>

            <View style={{ height: spacing.xl }} />
          </ScrollView>
        ) : null}
      </StateView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, gap: spacing.xs },
  headerCard: { gap: spacing.md },
  headerRow: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 20, fontWeight: "800", color: colors.text },
  industry: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  websiteRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  website: { fontSize: 14, color: colors.primary, flex: 1 },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "800", color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  section: { fontSize: 16, fontWeight: "700", color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  contactName: { fontSize: 16, fontWeight: "700", color: colors.text },
  contactLink: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm },
  contactLinkText: { fontSize: 14, color: colors.primary },
  listCard: { padding: 0 },
  row: { flexDirection: "row", alignItems: "center", padding: spacing.lg },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  rowTitleDone: { textDecorationLine: "line-through", color: colors.textFaint },
  rowSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  rowRight: { alignItems: "flex-end", gap: spacing.xs, marginLeft: spacing.md },
  rowValue: { fontSize: 15, fontWeight: "700", color: colors.text },
  empty: { padding: spacing.lg, fontSize: 14, color: colors.textMuted, textAlign: "center" },
});
