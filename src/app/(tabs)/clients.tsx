import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useClients } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import { formatCompactMoney } from "@/lib/format";
import { Avatar, Badge, Card, StateView } from "@/components/ui";
import { ListHeader } from "@/components/list-header";
import { colors, labelize, spacing, statusTone } from "@/theme";

export default function ClientsScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useClients();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ListHeader
        title="Clients"
        subtitle={data ? `${data.length} accounts` : undefined}
        onAdd={() => router.push("/new?type=client")}
      />
      <StateView
        loading={isLoading}
        error={error ? (error instanceof ApiError ? error.message : "Failed to load.") : null}
        empty={data?.length === 0}
        emptyText="No clients yet. Tap + to add one."
        onRetry={refetch}
      >
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/client/${item.id}`)}>
              <Card style={styles.card}>
                <Avatar name={item.name} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.sub} numberOfLines={1}>
                    {item.industry ?? "General"}
                    {item.primaryContact ? ` · ${item.primaryContact.name}` : ""}
                  </Text>
                  <View style={styles.metaRow}>
                    <Badge tone={statusTone[item.status]} label={labelize(item.status)} />
                    <Text style={styles.meta}>
                      {item.openDeals} deals · {item.openTasks} tasks
                    </Text>
                  </View>
                </View>
                <View style={styles.right}>
                  <Text style={styles.value}>{formatCompactMoney(item.pipelineValue)}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                </View>
              </Card>
            </Pressable>
          )}
        />
      </StateView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, paddingTop: spacing.xs, gap: spacing.md },
  card: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 16, fontWeight: "700", color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm },
  meta: { fontSize: 12, color: colors.textFaint },
  right: { alignItems: "flex-end", marginLeft: spacing.sm, gap: spacing.xs },
  value: { fontSize: 15, fontWeight: "700", color: colors.text },
});
