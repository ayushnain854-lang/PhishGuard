import React, { useState, useEffect, useContext, useCallback } from "react";
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Dimensions, Platform 
} from "react-native";
import { AuthContext } from "../../App";
import { dashboardAPI } from "../utils/api";
import { 
  ShieldAlert, Mail, Link2, Image, MessageSquare, 
  Settings, LogOut, ShieldCheck, Activity, Award 
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function DashboardScreen({ navigation }) {
  const { token, user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    security_score: 80,
    threats_avoided: 0,
    messages_scanned: 0,
    websites_checked: 0,
    total_scans: 0,
    threats_detected: 0,
    suspicious_detected: 0,
    safe_scans: 0,
  });

  const loadDashboard = async () => {
    try {
      const data = await dashboardAPI.fetchAnalytics(token);
      setMetrics(data.dashboard_metrics);
    } catch (e) {
      console.error("Dashboard metrics load failed:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // Safe / green
    if (score >= 50) return "#f59e0b"; // Warning / amber
    return "#ef4444"; // Danger / red
  };

  const scoreColor = getScoreColor(metrics.security_score);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  const features = [
    { name: "Message Scanner", route: "MessageScanner", desc: "Scan emails & texts for linguistic flags", icon: Mail, color: "#3b82f6" },
    { name: "URL Scanner", route: "URLScanner", desc: "Verify lookalike domains & TLD risk", icon: Link2, color: "#06b6d4" },
    { name: "Screenshot Scanner", route: "ScreenshotScanner", desc: "Extract screenshot text for OCR threat scans", icon: Image, color: "#8b5cf6" },
    { name: "AI Cyber Assistant", route: "Chat", desc: "Interact with secure cognitive agent", icon: MessageSquare, color: "#ec4899" },
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />
      }
    >
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <View>
          <Text style={styles.welcomeSub}>Welcome Back, Agent</Text>
          <Text style={styles.welcomeTitle}>{user?.username || "Sentinel"}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <LogOut size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Security Status Dial */}
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreDial, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>{metrics.security_score}</Text>
          <Text style={styles.scoreLabel}>System Score</Text>
        </View>
        <View style={styles.statusBanner}>
          {metrics.security_score >= 80 ? (
            <View style={styles.badgeSafe}>
              <ShieldCheck size={16} color="#10b981" />
              <Text style={styles.badgeSafeText}>Secure Integrity</Text>
            </View>
          ) : (
            <View style={styles.badgeDanger}>
              <ShieldAlert size={16} color="#ef4444" />
              <Text style={styles.badgeDangerText}>Degraded Shields</Text>
            </View>
          )}
        </View>
      </View>

      {/* Analytics Cards Grid */}
      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Award size={20} color="#10b981" />
          <Text style={styles.statNumber}>{metrics.threats_avoided}</Text>
          <Text style={styles.statLabel}>Threats Blocked</Text>
        </View>
        <View style={styles.statCard}>
          <Activity size={20} color="#3b82f6" />
          <Text style={styles.statNumber}>{metrics.total_scans}</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </View>
      </View>

      {/* Threat Category Scanner Options */}
      <Text style={styles.sectionHeader}>Mitigation Modules</Text>
      <View style={styles.moduleList}>
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity 
              key={idx} 
              style={styles.moduleCard}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={[styles.moduleIconContainer, { backgroundColor: `${item.color}20`, borderColor: `${item.color}40` }]}>
                <Icon size={22} color={item.color} />
              </View>
              <View style={styles.moduleTextContainer}>
                <Text style={styles.moduleName}>{item.name}</Text>
                <Text style={styles.moduleDesc}>{item.desc}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Settings Navigation button */}
      <TouchableOpacity 
        style={styles.settingsRow}
        onPress={() => navigation.navigate("Settings")}
      >
        <Settings size={18} color="#94a3b8" />
        <Text style={styles.settingsText}>Sentinel Configuration Settings</Text>
      </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: "#080c14",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeSub: {
    fontSize: 11,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontWeight: "bold",
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 4,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
    borderRadius: 12,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  scoreDial: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "900",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 1,
    marginTop: 2,
  },
  statusBanner: {
    marginTop: 16,
  },
  badgeSafe: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeSafeText: {
    color: "#10b981",
    fontSize: 11,
    fontWeight: "bold",
  },
  badgeDanger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeDangerText: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: "bold",
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  moduleList: {
    gap: 12,
    marginBottom: 24,
  },
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    padding: 16,
  },
  moduleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  moduleTextContainer: {
    flex: 1,
  },
  moduleName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
  moduleDesc: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 15,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginTop: 10,
  },
  settingsText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "bold",
  },
});
