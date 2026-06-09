import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients, radius, spacing, type GradientKey, type Tone } from "@/theme";
import { initials } from "@/lib/format";

export function Badge({ tone, label }: { tone: Tone; label: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.badgeText, { color: tone.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials(name) || "?"}</Text>
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "danger" | "ghost";
}) {
  const isDisabled = disabled || loading;
  const palette =
    variant === "danger"
      ? { bg: colors.danger, fg: colors.white }
      : variant === "ghost"
        ? { bg: colors.slateSoft, fg: colors.slate }
        : { bg: colors.primary, fg: colors.white };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <Text style={[styles.buttonText, { color: palette.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function GradientButton({
  title,
  onPress,
  loading,
  disabled,
  gradient = "brand",
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  gradient?: GradientKey;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable onPress={onPress} disabled={isDisabled} style={({ pressed }) => ({ opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1 })}>
      <LinearGradient
        colors={gradients[gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientButton}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.gradientButtonText}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export function Field({
  label,
  error,
  multiline,
  ...inputProps
}: { label: string; error?: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline ? styles.inputMultiline : null, error ? styles.inputError : null]}
        placeholderTextColor={colors.textFaint}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : undefined}
        {...inputProps}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function StateView({
  loading,
  error,
  empty,
  emptyText,
  onRetry,
  children,
}: {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.stateTitle}>Couldn&apos;t load this</Text>
        <Text style={styles.stateText}>{error}</Text>
        {onRetry ? (
          <View style={{ marginTop: spacing.lg }}>
            <PrimaryButton title="Try again" onPress={onRetry} variant="ghost" />
          </View>
        ) : null}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.center}>
        <Text style={styles.stateText}>{emptyText ?? "Nothing here yet."}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  avatar: { backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.primary, fontWeight: "700" },
  button: {
    height: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
  gradientButton: {
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  gradientButtonText: { fontSize: 16, fontWeight: "700", color: colors.white },
  field: { marginBottom: spacing.lg },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: colors.textMuted, marginBottom: spacing.xs + 2 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputMultiline: {
    height: undefined,
    minHeight: 110,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  inputError: { borderColor: colors.danger },
  fieldError: { color: colors.danger, fontSize: 12, marginTop: spacing.xs },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.xs },
  stateTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  stateText: { fontSize: 14, color: colors.textMuted, textAlign: "center" },
});
