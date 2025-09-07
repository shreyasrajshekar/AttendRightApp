import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

export default function Dashboard({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.subtitle}>Quick access to everything you need 🚀</Text>

      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Add Attendance")}
        >
          <Ionicons name="clipboard-outline" size={40} color="#4eb8e6" />
          <Text style={styles.cardText}>Add Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Timetable")}
        >
          <MaterialCommunityIcons name="calendar-month-outline" size={40} color="#4eb8e6" />
          <Text style={styles.cardText}>Timetable</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Advice Chat")}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={40} color="#4eb8e6" />
          <Text style={styles.cardText}>Advice Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Status")}
        >
          <FontAwesome5 name="tasks" size={40} color="#4eb8e6" />
          <Text style={styles.cardText}>Status</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#b3e9ffff",
    flexGrow: 1,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  subtitle: {
    fontSize: 21,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
    paddingTop:20,
    fontFamily: "Poppins-Regular",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
    paddingTop:100,
  },
  card: {
    width: "40%",
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    paddingBottom:20,
  },
  cardText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});
