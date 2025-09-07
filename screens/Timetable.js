import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../supabase";

// subjects list
const subjectsData = [
  { Subject: "Calculus and Differential Equations", ConductedClasses: 15 },
  { Subject: "Materials Chemistry for Devices and E-Waste Manage", ConductedClasses: 12 },
  { Subject: "Problem Solving Through Programming", ConductedClasses: 11 },
  { Subject: "Basic Electronics", ConductedClasses: 12 },
  { Subject: "Environmental Science & Sustainability", ConductedClasses: 3 },
  { Subject: "Communicative English", ConductedClasses: 8 },
  { Subject: "Engineering Visualization", ConductedClasses: 54 },
  { Subject: "Biology for Engineers", ConductedClasses: 10 },
];

export default function Timetable() {
  const [examStartDate, setExamStartDate] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(subjectsData[0].Subject);
  const [classesPerWeek, setClassesPerWeek] = useState("");
  const [savedData, setSavedData] = useState([]);

  // fetch saved
  const fetchSavedData = async () => {
    const { data, error } = await supabase
      .from("timetables")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setSavedData(data);
  };

  // insert record
  const saveData = async () => {
    if (!examStartDate || !selectedSubject || !classesPerWeek) {
      Alert.alert("⚠️ Error", "Please fill all fields");
      return;
    }

    const { error } = await supabase.from("timetables").insert([
      {
        subject: selectedSubject,
        classes_per_week: parseInt(classesPerWeek),
        exam_start_date: examStartDate,
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
      Alert.alert("❌ Error", "Could not save data");
    } else {
      Alert.alert("✅ Success", "Data saved successfully");
      setClassesPerWeek("");
      fetchSavedData();
    }
  };

  useEffect(() => {
    fetchSavedData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📅 Timetable Planner</Text>

      <View style={styles.card}>
        <Text style={styles.label}> Exam Start Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={examStartDate}
          onChangeText={setExamStartDate}
        />

        <Text style={styles.label}> Select Subject</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedSubject}
            onValueChange={(itemValue) => setSelectedSubject(itemValue)}
          >
            {subjectsData.map((s, index) => (
              <Picker.Item key={index} label={s.Subject} value={s.Subject} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}> Classes Per Week</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number"
          keyboardType="numeric"
          value={classesPerWeek}
          onChangeText={setClassesPerWeek}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={saveData}>
          <Text style={styles.buttonText}> Save</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>📂 Saved Timetables</Text>
      {savedData.length === 0 ? (
        <Text style={{ marginTop: 10, color: "#777" }}>
          No timetables saved yet.
        </Text>
      ) : (
        savedData.map((item) => (
          <View key={item.id} style={styles.savedCard}>
            <Text style={styles.savedSubject}>📘 {item.subject}</Text>
            <Text style={styles.savedText}>🗓 Exam Start: {item.exam_start_date}</Text>
            <Text style={styles.savedText}>📊 {item.classes_per_week} classes/week</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f9fafb" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#333" },
  label: { fontSize: 16, fontWeight: "600", marginTop: 10, color: "#444" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  primaryButton: {
    backgroundColor: "#4eb8e6",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  subtitle: { fontSize: 18, fontWeight: "600", marginTop: 25, color: "#444" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  savedCard: {
    backgroundColor: "#e8f6ff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
  },
  savedSubject: { fontWeight: "bold", fontSize: 16, color: "#333" },
  savedText: { color: "#555", marginTop: 3 },
});
