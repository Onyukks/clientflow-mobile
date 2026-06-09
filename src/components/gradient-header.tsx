import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, radius, spacing, type GradientKey } from "@/theme";

type HeaderAction = { icon: keyof typeof Ionicons.glyphMap; onPress: () => void };

export function GradientHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  gradient = "header",
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: HeaderAction[];
  gradient?: GradientKey;
  children?: ReactNode;
}) {
  return (
    <LinearGradient
      colors={gradients[gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView edges={["top"]}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {actions?.map((action, index) => (
            <Pressable
              key={index}
              onPress={action.onPress}
              hitSlop={8}
              style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name={action.icon} size={20} color={colors.white} />
            </Pressable>
          ))}
        </View>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderBottomLeftRadius: radius.xl + 8,
    borderBottomRightRadius: radius.xl + 8,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingTop: spacing.sm },
  eyebrow: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  title: { color: colors.white, fontSize: 26, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 3 },
  action: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
});
