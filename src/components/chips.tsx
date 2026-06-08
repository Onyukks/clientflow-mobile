import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, labelize, radius, spacing } from "@/theme";

export type ChipOption = { value: string; label?: string };

export function ChipSelect({
  label,
  options,
  value,
  onChange,
  scroll,
}: {
  label?: string;
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  scroll?: boolean;
}) {
  const chips = options.map((option) => {
    const active = option.value === value;
    return (
      <Pressable
        key={option.value}
        onPress={() => onChange(option.value)}
        style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
      >
        <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextIdle]} numberOfLines={1}>
          {option.label ?? labelize(option.value)}
        </Text>
      </Pressable>
    );
  });

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {scroll ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {chips}
        </ScrollView>
      ) : (
        <View style={styles.rowWrap}>{chips}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: "600", color: colors.textMuted, marginBottom: spacing.sm },
  row: { gap: spacing.sm, paddingRight: spacing.lg },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1 },
  chipIdle: { backgroundColor: colors.surface, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "600" },
  chipTextIdle: { color: colors.textMuted },
  chipTextActive: { color: colors.white },
});
