import React, { useState, useContext } from "react";
import { 
  StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, 
  ActivityIndicator, Platform 
} from "react-native";
import { AuthContext } from "../../App";
import { scannerAPI } from "../utils/api";
import * as ImagePicker from "expo-image-picker";
import { Shield, Sparkles, HelpCircle, ImageIcon, Upload } from "lucide-react-native";

export default function ScreenshotScannerScreen() {
  const { token } = useContext(AuthContext);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const pickImage = async () => {
    // Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError("Permission to access camera roll is required!");
      return;
    }

    setError("");
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setImageUri(pickerResult.assets[0].uri);
      setResult(null);
    }
  };

  const handleScan = async () => {
    if (!imageUri) {
      setError("Please select a screenshot image first.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const data = await scannerAPI.scanImage(imageUri, token);
      setResult(data);
    } catch (e) {
      console.error(e);
      setError("Network error connecting to PhishGuard API. Ensure Flask server is online.");
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
        <Text style={styles.title}>Message Screenshot Scan (OCR)</Text>
        
        {imageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="contain" />
            <TouchableOpacity style={styles.repickButton} onPress={pickImage}>
              <Text style={styles.repickText}>Select Another Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            <Upload size={32} color="#06b6d4" />
            <Text style={styles.uploadBoxText}>Upload Message Screenshot</Text>
            <Text style={styles.uploadBoxSub}>Select from device photo library</Text>
          </TouchableOpacity>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {imageUri && (
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleScan}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Extract Text & Analyze</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Result Display */}
      {result && (
        <View style={[styles.resultCard, { borderColor: colors.border }]}>
          {/* Verdict Banner */}
          <View style={[styles.verdictHeader, { backgroundColor: colors.bg, borderLeftColor: colors.color }]}>
            <View>
              <Text style={styles.verdictLabel}>Screenshot Scan Verdict</Text>
              <Text style={[styles.verdictText, { color: colors.color }]}>{result.prediction}</Text>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>Risk: {result.risk_score}%</Text>
            </View>
          </View>

          {/* Extracted Text */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Extracted Character Text</Text>
            <View style={styles.extractedTextContainer}>
              <Text style={styles.extractedText}>{result.extracted_text || "No text could be extracted."}</Text>
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
              <Text style={styles.sectionTitle}>Threat Indicators Found</Text>
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
    marginBottom: 16,
  },
  uploadBox: {
    height: 160,
    borderWidth: 1,
    borderColor: "#1e293b",
    borderStyle: "dashed",
    borderRadius: 16,
    backgroundColor: "#030712",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  uploadBoxText: {
    fontSize: 14,
    color: "#f3f4f6",
    fontWeight: "bold",
    marginTop: 12,
  },
  uploadBoxSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
  },
  imagePreviewContainer: {
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: "#000000",
  },
  repickButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  repickText: {
    fontSize: 12,
    color: "#cbd5e1",
    fontWeight: "bold",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 12,
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
  section: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    paddingTop: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  extractedTextContainer: {
    padding: 12,
    backgroundColor: "#030712",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  extractedText: {
    fontSize: 12,
    color: "#e2e8f0",
    lineHeight: 18,
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
