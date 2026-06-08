import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDeals } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import { formatDueLabel, formatMoney } from "@/lib/format";
import { Badge, Card, StateView } from "@/components/ui";
import { ListHeader } from "@/components/list-header";
import { colors, spacing, stageTone } from "@/theme";

export default function DealsScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useDeals();
  const openValue = data?.reduce((total, deal) => total + deal.value, 0) ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ListHeader
        title="Deals"
        subtitle={data ? `${data.length} deals · ${formatMoney(openValue)} total` : undefined}
        onAdd={() => router.push("/new?type=deal")}
      />
      <StateView
        loading={isLoading}
        error={error ? (error instanceof ApiError ? error.message : "Failed to load.") : null}
        empty={data?.length === 0}
        emptyText="No deals yet. Tap + to add one."
        onRetry={refetch}
      >
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.topRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.value}>{formatMoney(item.value)}</Text>
              </View>
              <Text style={styles.sub} numberOfLines={1}>
                {item.clientName}
              </Text>
              <View style={styles.metaRow}>
                <Badge tone={stageTone[item.stage]} label={item.stage} />
                <Text style={styles.meta}>{item.probability}% likely</Text>
                <Text style={styles.meta}>· {formatDueLabel(item.expectedCloseDate)}</Text>
              </View>
            </Card>
          )}
        />
      </StateView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, paddingTop: spacing.xs, gap: spacing.md },
  card: { gap: spacing.xs },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  title: { fontSize: 16, fontWeight: "700", color: colors.text, flex: 1 },
  value: { fontSize: 16, fontWeight: "800", color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs },
  meta: { fontSize: 12, color: colors.textFaint },
});
