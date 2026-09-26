import React, { useState } from "react";
import { 
  StyleSheet, Text, View, Switch, TextInput, TouchableOpacity, 
  ScrollView, Platform, Alert 
} from "react-native";
import api, { API_HOST } from "../utils/api";
import { Settings, Shield, Globe, Bell } from "lucide-react-native";

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [realtimeScan, setRealtimeScan] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [customIp, setCustomIp] = useState(API_HOST);

  const saveIpConfig = () => {
    if (!customIp.trim()) {
      Alert.alert("Configuration Error", "Please input a valid IP address.");
      return;
    }
    
    // Dynamically update Axios base URL instance configuration!
    api.defaults.baseURL = `http://${customIp.trim()}:5000`;
    Alert.alert("Success", `Backend target redirected to http://${customIp.trim()}:5000`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Settings size={18} color="#06b6d4" />
          <Text style={styles.sectionTitle}>Sentinel Preferences</Text>
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>Terminal Dark Mode</Text>
            <Text style={styles.rowSub}>Saves display battery and matches console styling</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#1e293b", true: "#06b6d4" }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>Real-time Scan Toggles</Text>
            <Text style={styles.rowSub}>Enables scanning overlay callbacks instantly</Text>
          </View>
          <Switch
            value={realtimeScan}
            onValueChange={setRealtimeScan}
            trackColor={{ false: "#1e293b", true: "#06b6d4" }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>Email Risk Warnings</Text>
            <Text style={styles.rowSub}>Triggers remote SMTP alerts when critical phishing is detected</Text>
          </View>
          <Switch
            value={emailAlerts}
            onValueChange={setEmailAlerts}
            trackColor={{ false: "#1e293b", true: "#06b6d4" }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Network Configuration */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Globe size={18} color="#3b82f6" />
          <Text style={[styles.sectionTitle, { color: "#3b82f6" }]}>API Server Redirection</Text>
        </View>

        <Text style={styles.ipDesc}>
          Set your computer's local network IP below so the mobile app can reach the Flask server running on port 5000.
        </Text>

        <View style={styles.ipInputRow}>
          <TextInput
            style={styles.ipInput}
            value={customIp}
            onChangeText={setCustomIp}
            placeholder="192.168.0.X"
            placeholderTextColor="#475569"
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.ipButton} onPress={saveIpConfig}>
            <Text style={styles.ipButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    gap: 20,
  },
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 24,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#06b6d4",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  rowSub: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 4,
    maxWidth: "80%",
    lineHeight: 14,
  },
  ipDesc: {
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 18,
    marginBottom: 16,
  },
  ipInputRow: {
    flexDirection: "row",
    gap: 12,
  },
  ipInput: {
    flex: 1,
    backgroundColor: "#030712",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    color: "#f3f4f6",
    fontSize: 14,
  },
  ipButton: {
    width: 80,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ipButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
