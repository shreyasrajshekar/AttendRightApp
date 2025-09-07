import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAdvice } from "./../gemini";

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const reply = await getAdvice(input);

      // use reply directly (prompt ensures short answers)
      const botMessage = { from: "bot", text: reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Couldn't fetch advice, try again!" },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={{ paddingVertical: 10 }}
        >
          {messages.map((m, i) => (
            <View
              key={i}
              style={[
                styles.messageBubble,
                m.from === "user" ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  m.from === "user" ? styles.userText : styles.botText,
                ]}
              >
                {m.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask advice..."
            style={styles.input}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 10,
  },
  messagesContainer: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 12,
    marginVertical: 5,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#4eb8e6",
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e5ea",
  },
  messageText: {
    fontSize: 15,
  },
  userText: {
    color: "white",
  },
  botText: {
    color: "black",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 5,
    paddingBottom: 100,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "white",
  },
  sendButton: {
    backgroundColor: "#4eb8e6",
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
