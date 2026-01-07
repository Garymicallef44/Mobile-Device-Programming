import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ConfirmationScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const params = useLocalSearchParams<{
    total?: string;
    garageName?: string;
    services?: string;
    mode?: string; // "garage" | "mobile"
    locationText?: string;
  }>();

  const total = params.total ?? "0.00";
  const garageName = params.garageName ?? "—";
  const services = params.services ?? "—";
  const mode = params.mode ?? "garage";
  const locationText = params.locationText ?? "—";

  const isDark = (colorScheme ?? "light") === "dark";
  const surface = isDark ? "#1d1f21" : "#f6f7f8";
  const border = isDark ? "#2a2d30" : "#e7e7e7";
  const successGreen = "#27ae60";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="check-circle" size={74} color={successGreen} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Payment Successful</Text>
        <Text style={[styles.subtitle, { color: theme.icon }]}>
          Your booking has been confirmed.
        </Text>

        <View style={[styles.hr, { backgroundColor: border }]} />

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.icon }]}>Total</Text>
          <Text style={[styles.valueBig, { color: theme.text }]}>€{total}</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.icon }]}>Services</Text>
          <Text style={[styles.value, { color: theme.text }]}>{services}</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.icon }]}>Type</Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {mode === "mobile" ? "Mobile Service" : "Garage Visit"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.icon }]}>
            {mode === "mobile" ? "Location" : "Garage"}
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {mode === "mobile" ? locationText : garageName}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.tint }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.primaryText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: border }]}
            onPress={() => router.push("/history")}
          >
            <Text style={[styles.secondaryText, { color: theme.text }]}>
              View History
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.note, { color: theme.icon }]}>
          Need help? Visit the Account tab for support.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },

  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    shadowColor: "black",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },

  iconWrap: { alignItems: "center", marginTop: 6, marginBottom: 8 },

  title: { fontSize: 26, fontWeight: "900", textAlign: "center" },
  subtitle: { marginTop: 6, fontSize: 14, textAlign: "center" },

  hr: { height: 1, marginVertical: 14 },

  row: { marginTop: 10 },
  label: { fontSize: 13, fontWeight: "800" },
  value: { marginTop: 5, fontSize: 15, fontWeight: "700" },
  valueBig: { marginTop: 5, fontSize: 20, fontWeight: "900" },

  actions: { marginTop: 18, gap: 10 },

  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryText: { color: "white", fontSize: 16, fontWeight: "900" },

  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  secondaryText: { fontSize: 16, fontWeight: "900" },

  note: { marginTop: 14, fontSize: 12, textAlign: "center" },
});
