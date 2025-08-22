import React, { useState } from "react";
import { View, TextInput, Button, Text, ScrollView } from "react-native";
import { analyzeTimetable, getAdvice } from "./../gemini";

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input) return;
    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const reply = await getAdvice(input);
    const botMessage = { from: "bot", text: reply };
    setMessages((prev) => [...prev, botMessage]);
    setInput("");
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <ScrollView style={{ flex: 1, marginBottom: 60 }}>
        {messages.map((m, i) => (
          <Text
            key={i}
            style={{
              marginVertical: 5,
              color: m.from === "user" ? "blue" : "green",
            }}
          >
            {m.from === "user" ? "You: " : "Bot: "}
            {m.text}
          </Text>
        ))}
      </ScrollView>
      <View style={{ flexDirection: "row", position: "absolute", bottom: 10, width: "100%" }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask advice..."
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            borderRadius: 5,
            marginBottom: 100,
          }}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}
