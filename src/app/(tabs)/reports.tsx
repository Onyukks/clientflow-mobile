import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useReports } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import { formatCompactMoney } from "@/lib/format";
import { Card, StateView } from "@/components/ui";
import { GradientHeader } from "@/components/gradient-header";
import { colors, labelize, radius, spacing, stageTone, statusTone, taskStatusTone, type Tone } from "@/theme";

function Bar({ percent, color }: { percent: number; color: string }) {
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${Math.min(100, Math.max(4, percent))}%`, backgroundColor: color }]} />
    </View>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <Card style={[styles.miniStat, { backgroundColor: tone.bg, borderColor: "transparent" }]}>
      <Text style={[styles.miniValue, { color: tone.fg }]}>{value}</Text>
      <Text style={[styles.miniLabel, { color: tone.fg }]}>{label}</Text>
    </Card>
  );
}

export default function ReportsScreen() {
  const { data, isLoading, error, refetch, isRefetching } = useReports();
  const totalStageValue = data?.stages.reduce((t, s) => t + s.totalValue, 0) ?? 0;
  const totalTasks = data?.taskBreakdown.reduce((t, s) => t + s.count, 0) ?? 0;
  const totalClients = data?.clientHealth.reduce((t, s) => t + s.count, 0) ?? 0;

  return (
    <View style={styles.safe}>
      <GradientHeader
        eyebrow="Analytics"
        title="Reports"
        subtitle={data ? `${data.headline.accounts} accounts · ${formatCompactMoney(data.headline.openPipeline)} open` : undefined}
        gradient="header"
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
              <View style={styles.statGrid}>
                <MiniStat label="Open pipeline" value={formatCompactMoney(data.metrics.openPipeline)} tone={{ bg: colors.successSoft, fg: colors.success }} />
                <MiniStat label="Weighted forecast" value={formatCompactMoney(data.metrics.weightedForecast)} tone={{ bg: colors.primarySoft, fg: colors.primary }} />
                <MiniStat label="Next 30 days" value={formatCompactMoney(data.metrics.nextThirtyDayValue)} tone={{ bg: colors.warningSoft, fg: colors.warning }} />
                <MiniStat label="Portfolio value" value={formatCompactMoney(data.metrics.portfolioValue)} tone={{ bg: colors.dangerSoft, fg: colors.danger }} />
              </View>

              <Text style={styles.section}>Pipeline by stage</Text>
              <Card>
                {data.stages.map((stage, index) => (
                  <View key={stage.stage} style={[styles.stageRow, index < data.stages.length - 1 && styles.divider]}>
                    <View style={styles.stageTop}>
                      <Text style={styles.stageLabel}>{labelize(stage.stage)}</Text>
                      <Text style={styles.stageValue}>{formatCompactMoney(stage.totalValue)}</Text>
                    </View>
                    <Bar
                      percent={totalStageValue ? (stage.totalValue / totalStageValue) * 100 : 0}
                      color={stageTone[stage.stage].fg}
                    />
                    <Text style={styles.stageMeta}>
                      {stage.count} deals · {stage.averageProbability}% avg · {formatCompactMoney(stage.weightedValue)} weighted
                    </Text>
                  </View>
                ))}
              </Card>

              <Text style={styles.section}>Client health</Text>
              <Card>
                {data.clientHealth.map((seg, index) => (
                  <View key={seg.status} style={[styles.healthRow, index < data.clientHealth.length - 1 && styles.divider]}>
                    <View style={[styles.dot, { backgroundColor: statusTone[seg.status].fg }]} />
                    <Text style={styles.healthLabel}>{labelize(seg.status)}</Text>
                    <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                      <Bar percent={totalClients ? (seg.count / totalClients) * 100 : 0} color={statusTone[seg.status].fg} />
                    </View>
                    <Text style={styles.healthCount}>{seg.count}</Text>
                  </View>
                ))}
              </Card>

              <Text style={styles.section}>Tasks</Text>
              <Card>
                {data.taskBreakdown.map((seg, index) => (
                  <View key={seg.status} style={[styles.healthRow, index < data.taskBreakdown.length - 1 && styles.divider]}>
                    <View style={[styles.dot, { backgroundColor: taskStatusTone[seg.status].fg }]} />
                    <Text style={styles.healthLabel}>{labelize(seg.status)}</Text>
                    <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                      <Bar percent={totalTasks ? (seg.count / totalTasks) * 100 : 0} color={taskStatusTone[seg.status].fg} />
                    </View>
                    <Text style={styles.healthCount}>{seg.count}</Text>
                  </View>
                ))}
                <Text style={styles.completion}>{data.metrics.taskCompletionRate}% of tasks completed</Text>
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
  scroll: { padding: spacing.lg },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: -spacing.xl },
  miniStat: { width: "47.5%", flexGrow: 1, paddingVertical: spacing.lg },
  miniValue: { fontSize: 20, fontWeight: "800" },
  miniLabel: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  section: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  stageRow: { paddingVertical: spacing.md },
  stageTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  stageLabel: { fontSize: 15, fontWeight: "600", color: colors.text },
  stageValue: { fontSize: 15, fontWeight: "700", color: colors.text },
  stageMeta: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: colors.slateSoft, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4 },
  healthRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  healthLabel: { fontSize: 14, fontWeight: "600", color: colors.text, width: 88 },
  healthCount: { fontSize: 14, fontWeight: "700", color: colors.text, width: 28, textAlign: "right" },
  completion: { fontSize: 13, color: colors.textMuted, marginTop: spacing.md, textAlign: "center" },
});
