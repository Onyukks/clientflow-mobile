import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useBilling } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { Badge, Card, StateView } from "@/components/ui";
import { colors, gradients, labelize, radius, spacing } from "@/theme";

function UsageRow({ label, value, limit, percent }: { label: string; value: number; limit: number; percent: number }) {
  return (
    <View style={styles.usageRow}>
      <View style={styles.usageTop}>
        <Text style={styles.usageLabel}>{label}</Text>
        <Text style={styles.usageValue}>
          {value} / {limit >= 500 ? "∞" : limit}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.min(100, Math.max(4, percent))}%` }]} />
      </View>
    </View>
  );
}

export default function BillingScreen() {
  const { data, isLoading, error, refetch, isRefetching } = useBilling();

  return (
    <View style={styles.safe}>
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
              <LinearGradient
                colors={gradients.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
              >
                <View style={styles.heroTop}>
                  <Text style={styles.heroEyebrow}>Current plan</Text>
                  <View style={styles.heroStatus}>
                    <Text style={styles.heroStatusText}>{labelize(data.status)}</Text>
                  </View>
                </View>
                <Text style={styles.heroPlan}>{data.planName}</Text>
                <Text style={styles.heroPrice}>
                  {data.price === 0 ? "Free" : `${formatMoney(data.price)}/mo`}
                </Text>
                <View style={styles.heroFooter}>
                  <Ionicons name="time-outline" size={15} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.heroFooterText}>Renews {formatDate(data.renewalDate)} · {data.daysRemaining} days left</Text>
                </View>
                <Text style={styles.heroMode}>{data.paymentMode}</Text>
              </LinearGradient>

              <Text style={styles.section}>Usage</Text>
              <Card>
                {data.usage.map((item) => (
                  <UsageRow key={item.label} {...item} />
                ))}
              </Card>

              <Text style={styles.section}>Plans</Text>
              {data.plans.map((plan) => (
                <Card key={plan.key} style={[styles.planCard, plan.current && styles.planCardActive]}>
                  <View style={styles.planTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planPrice}>{plan.price === 0 ? "Free" : `${formatMoney(plan.price)}/mo`}</Text>
                    </View>
                    {plan.current ? <Badge tone={{ bg: colors.primarySoft, fg: colors.primary }} label="Current" /> : null}
                  </View>
                  <Text style={styles.planDesc}>{plan.description}</Text>
                  {plan.features.map((feature) => (
                    <View key={feature} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </Card>
              ))}

              <Text style={styles.section}>Team</Text>
              <Card style={styles.listCard}>
                {data.members.map((member, index) => (
                  <View key={member.email} style={[styles.memberRow, index < data.members.length - 1 && styles.divider]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    </View>
                    <Badge tone={{ bg: colors.slateSoft, fg: colors.slate }} label={member.role} />
                  </View>
                ))}
              </Card>

              <Text style={styles.section}>Invoice history</Text>
              <Card style={styles.listCard}>
                {data.history.map((item, index) => (
                  <View key={item.id} style={[styles.memberRow, index < data.history.length - 1 && styles.divider]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{item.label}</Text>
                      <Text style={styles.memberEmail}>{formatDate(item.date)} · {item.status}</Text>
                    </View>
                    <Text style={styles.invoiceAmount}>{formatMoney(item.amount)}</Text>
                  </View>
                ))}
              </Card>
              <Text style={styles.note}>Stripe test mode — no real card is ever charged.</Text>
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
  scroll: { padding: spacing.lg },
  hero: { borderRadius: radius.xl, padding: spacing.xl },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroEyebrow: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600" },
  heroStatus: { backgroundColor: "rgba(255,255,255,0.22)", paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill },
  heroStatusText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  heroPlan: { color: colors.white, fontSize: 30, fontWeight: "800", marginTop: spacing.sm },
  heroPrice: { color: "rgba(255,255,255,0.95)", fontSize: 18, fontWeight: "700", marginTop: 2 },
  heroFooter: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.lg },
  heroFooterText: { color: "rgba(255,255,255,0.9)", fontSize: 13 },
  heroMode: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: spacing.xs },
  section: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  usageRow: { paddingVertical: spacing.sm },
  usageTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  usageLabel: { fontSize: 14, fontWeight: "600", color: colors.text },
  usageValue: { fontSize: 14, fontWeight: "700", color: colors.textMuted },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: colors.slateSoft, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  planCard: { marginBottom: spacing.md, gap: spacing.xs },
  planCardActive: { borderColor: colors.primary, borderWidth: 2 },
  planTop: { flexDirection: "row", alignItems: "flex-start" },
  planName: { fontSize: 17, fontWeight: "800", color: colors.text },
  planPrice: { fontSize: 14, fontWeight: "700", color: colors.primary, marginTop: 2 },
  planDesc: { fontSize: 13, color: colors.textMuted, marginVertical: spacing.xs },
  featureRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs },
  featureText: { fontSize: 14, color: colors.text },
  listCard: { padding: 0, overflow: "hidden" },
  memberRow: { flexDirection: "row", alignItems: "center", padding: spacing.lg },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  memberName: { fontSize: 15, fontWeight: "600", color: colors.text },
  memberEmail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  invoiceAmount: { fontSize: 15, fontWeight: "700", color: colors.text },
  note: { fontSize: 12, color: colors.textFaint, textAlign: "center", marginTop: spacing.lg },
});
