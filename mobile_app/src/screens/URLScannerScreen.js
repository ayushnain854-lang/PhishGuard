import React, { useState, useContext } from "react";
import { 
  StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, 
  ActivityIndicator, Platform 
} from "react-native";
import { AuthContext } from "../../App";
import { scannerAPI } from "../utils/api";
import { Shield, Sparkles, HelpCircle } from "lucide-react-native";

export default function URLScannerScreen() {
  const { token } = useContext(AuthContext);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!url.trim()) {
      setError("Please input a valid URL link address.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const data = await scannerAPI.scanUrl(url.trim(), token);
      setResult(data);
    } catch (e) {
      console.error(e);
      setError("Network error connecting to PhishGuard API.");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictStyle = (verdict) => {
    if (verdict === "Phishing") return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.08)", border: "#ef4444" };
    if (verdict === "Suspicious") return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)", border: "#f59e0b" };
    return { color: "#10b981", bg: "rgba(16, 185, 129, 0.08)", border: "#10b981" };
  };

  const colors = result ? getVerdictStyle(result.prediction) : {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Scan URL Address</Text>
        <TextInput
          style={styles.input}
          placeholder="http://sbi-login-access-verification.xyz/login"
          placeholderTextColor="#475569"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          value={url}
          onChangeText={setUrl}
        />
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleScan}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Check URL safety</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Result Display */}
      {result && (
        <View style={[styles.resultCard, { borderColor: colors.border }]}>
          <View style={[styles.verdictHeader, { backgroundColor: colors.bg, borderLeftColor: colors.color }]}>
            <View>
              <Text style={styles.verdictLabel}>Domain Security Rating</Text>
              <Text style={[styles.verdictText, { color: colors.color }]}>{result.prediction}</Text>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>Risk: {result.risk_score}%</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.categoryLabel}>Threat Classification: </Text>
            <Text style={styles.categoryValue}>{result.threat_category}</Text>
          </View>

          {/* Explanation Reasons */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Sparkles size={16} color="#06b6d4" />
              <Text style={styles.sectionTitle}>Domain Analysis Explanations</Text>
            </View>
            {result.reasons.map((reason, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bulletSymbol}>▪</Text>
                <Text style={styles.bulletText}>{reason}</Text>
              </View>
            ))}
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <HelpCircle size={16} color="#10b981" />
              <Text style={[styles.sectionTitle, { color: "#10b981" }]}>Incident Mitigation Plan</Text>
            </View>
            {result.recommendations.map((rec, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={[styles.bulletSymbol, { color: "#10b981" }]}>✓</Text>
                <Text style={styles.bulletText}>{rec}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080c14",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#030712",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    color: "#f3f4f6",
    fontSize: 14,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
  },
  button: {
    height: 48,
    backgroundColor: "#06b6d4",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  resultCard: {
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  verdictHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  verdictLabel: {
    fontSize: 9,
    color: "#94a3b8",
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  verdictText: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#f3f4f6",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  categoryValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#06b6d4",
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    paddingTop: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#06b6d4",
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingLeft: 4,
  },
  bulletSymbol: {
    fontSize: 10,
    color: "#06b6d4",
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: "#cbd5e1",
    lineHeight: 18,
  },
});
