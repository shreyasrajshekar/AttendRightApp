import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../supabase";
import { getClientId } from "../ClientId";

export default function AddAttendance() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedAttendance, setSavedAttendance] = useState([]);

  // pick attendance screenshot
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  // upload attendance screenshot + extracted JSON
  const uploadAttendance = async () => {
    if (!image) return Alert.alert("Error", "Please select a screenshot first");
    try {
      setLoading(true);
      const clientId = await getClientId();

      const response = await fetch("https://attendrightapp.onrender.com/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          base64Image: image.base64,
        }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      if (
        !result.attendance_data ||
        !Array.isArray(result.attendance_data) ||
        result.attendance_data.length === 0
      ) {
        Alert.alert(
          "Error",
          "No attendance data could be extracted from the image."
        );
        setLoading(false);
        return;
      }

      Alert.alert("✅ Success", "Attendance extracted and saved!");
      setImage(null);
      fetchSavedAttendance();
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // fetch saved attendance
  const fetchSavedAttendance = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSavedAttendance(data);
    }
  };

  // clear database
  const clearAttendance = async () => {
    Alert.alert("Confirm", "Do you want to delete all attendance records?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("attendance").delete().neq("id", 0);
          if (error) {
            Alert.alert("Error", "Failed to clear data");
          } else {
            Alert.alert("Cleared", "All attendance records removed");
            setSavedAttendance([]);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchSavedAttendance();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}> Upload Attendance Screenshot</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
        <Text style={styles.buttonText}>Choose Screenshot</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image.uri }} style={styles.preview} />}

      {loading ? (
        <ActivityIndicator size="large" color="#4eb8e6" style={{ margin: 15 }} />
      ) : (
        image && (
          <TouchableOpacity style={styles.primaryButton} onPress={uploadAttendance}>
            <Text style={styles.buttonText}>Upload & Save</Text>
          </TouchableOpacity>
        )
      )}

      <TouchableOpacity style={styles.dangerButton} onPress={clearAttendance}>
        <Text style={styles.buttonText}>🗑 Clear Attendance Data</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>📂 Saved Attendance</Text>
      {savedAttendance.length === 0 ? (
        <Text style={{ marginTop: 10, color: "#777" }}>
          No records saved yet.
        </Text>
      ) : (
        savedAttendance.map((a) => (
          <View key={a.id} style={styles.card}>
            {a.screenshot ? (
              <Image
                source={{ uri: `data:image/png;base64,${a.screenshot}` }}
                style={styles.savedImage}
              />
            ) : (
              <Text>No image</Text>
            )}
            <Text style={styles.timestamp}>
              {new Date(a.created_at).toLocaleString()}
            </Text>
            {a.attendance_data ? (
              <Text style={styles.jsonText}>
                {JSON.stringify(a.attendance_data, null, 2)}
              </Text>
            ) : (
              <Text>No extracted data</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center", backgroundColor: "#f9fafb" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#333" },
  subtitle: { fontSize: 18, fontWeight: "600", marginTop: 25, color: "#444" },
  primaryButton: {
    backgroundColor: "#4eb8e6",
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  dangerButton: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  preview: {
    width: 250,
    height: 350,
    marginVertical: 20,
    resizeMode: "contain",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  card: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  savedImage: { width: 200, height: 280, resizeMode: "contain" },
  timestamp: { fontSize: 12, color: "#777", marginTop: 5 },
  jsonText: { fontSize: 12, marginTop: 5, color: "#444" },
});
