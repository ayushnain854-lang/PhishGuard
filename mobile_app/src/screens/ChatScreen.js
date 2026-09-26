import React, { useState, useContext, useRef } from "react";
import { 
  StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions 
} from "react-native";
import { AuthContext } from "../../App";
import { chatAPI } from "../utils/api";
import { Terminal, Send, Bot, User } from "lucide-react-native";

export default function ChatScreen() {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello, Agent. I am PhishGuard AI Cyber Assistant. How can I assist you with threat mitigation or incident audits today?"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) setInputText("");

    // Append user message
    const updatedMessages = [...messages, { sender: "user", text: text }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const data = await chatAPI.sendMessage(text.trim(), token);
      setMessages([...updatedMessages, { sender: "bot", text: data.response }]);
    } catch (e) {
      console.error(e);
      setMessages([...updatedMessages, { sender: "bot", text: "⚠️ Could not connect to PG cognitive core. Ensure Flask API is running." }]);
    } finally {
      setLoading(false);
    }
  };

  const parseInlineStyles = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <Text key={i} style={styles.boldText}>
            {part.substring(2, part.length - 2)}
          </Text>
        );
      }
      return <Text key={i} style={styles.normalText}>{part}</Text>;
    });
  };

  const quickQuestions = [
    "How can I identify phishing?",
    "I clicked a suspicious link, what should I do?",
    "What are common SMS scam indicators?"
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      style={styles.container}
    >
      {/* Code core title */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Terminal size={16} color="#06b6d4" />
          <Text style={styles.headerTitle}>PG_COGNITIVE_CORE // SEC_AGENT</Text>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Ready</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, idx) => {
          const isBot = msg.sender === "bot";
          return (
            <View 
              key={idx} 
              style={[
                styles.messageRow, 
                isBot ? styles.rowBot : styles.rowUser
              ]}
            >
              <View style={[styles.avatar, isBot ? styles.avatarBot : styles.avatarUser]}>
                {isBot ? <Bot size={14} color="#06b6d4" /> : <User size={14} color="#3b82f6" />}
              </View>
              <View style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}>
                <Text style={styles.messageText}>
                  {parseInlineStyles(msg.text)}
                </Text>
              </View>
            </View>
          );
        })}
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#06b6d4" />
            <Text style={styles.loadingText}>Synthesizing audit response...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Questions helper */}
      {messages.length === 1 && (
        <View style={styles.quickQuestionsContainer}>
          {quickQuestions.map((q, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.quickQuestionCard}
              onPress={() => handleSend(q)}
            >
              <Text style={styles.quickQuestionText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask PG AI Cyber Assistant..."
          placeholderTextColor="#475569"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
          <Send size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080c14",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#030712",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#64748b",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(6, 182, 212, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.2)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#06b6d4",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#06b6d4",
    textTransform: "uppercase",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    maxWidth: "85%",
    gap: 12,
  },
  rowBot: {
    alignSelf: "flex-start",
  },
  rowUser: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarBot: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
  },
  avatarUser: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  bubbleBot: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
  },
  bubbleUser: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderColor: "rgba(59, 130, 246, 0.25)",
  },
  messageText: {
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 18,
  },
  boldText: {
    fontWeight: "bold",
    color: "#ffffff",
  },
  normalText: {
    color: "#cbd5e1",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 40,
    marginTop: 4,
  },
  loadingText: {
    fontSize: 11,
    color: "#64748b",
  },
  quickQuestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  quickQuestionCard: {
    padding: 12,
    backgroundColor: "rgba(6, 182, 212, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.15)",
    borderRadius: 12,
  },
  quickQuestionText: {
    fontSize: 12,
    color: "#06b6d4",
    fontWeight: "bold",
  },
  inputRow: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#030712",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#080c14",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 44,
    color: "#f3f4f6",
    fontSize: 13,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
  },
});
