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

// ✅ Gemini API call helper
async function extractAttendance(base64Image) {
  try {
    const response = await fetch("http://localhost:3000/extract", { // your server.js Gemini endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: base64Image,
        prompt:
          "Extract attendance details from this screenshot. Return JSON array like [{subject:'ECE111', attended:30, total:34}, ...].",
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result; // parsed JSON
  } catch (err) {
    console.error("Gemini extract error:", err);
    return null;
  }
}

export default function AddAttendance() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedAttendance, setSavedAttendance] = useState([]);

  // pick attendance screenshot
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true, // ✅ we need base64
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  // upload attendance (with Gemini extraction)
  const uploadAttendance = async () => {
    if (!image) {
      Alert.alert("Error", "Please select a screenshot first");
      return;
    }

    try {
      setLoading(true);
      const clientId = await getClientId();

      // ✅ Step 1: Extract JSON from Gemini
      const extractedJson = await extractAttendance(image.base64);

      if (!extractedJson) {
        Alert.alert("Error", "Failed to extract attendance from screenshot.");
        setLoading(false);
        return;
      }

      // ✅ Step 2: Save image + extracted data to Supabase
      const { error: insertError } = await supabase.from("attendance").insert([
        {
          user_id: clientId,
          screenshot: image.base64, // base64 image
          attendance_data: extractedJson, // JSON from Gemini
        },
      ]);

      if (insertError) throw insertError;

      Alert.alert("Success", "Attendance saved!");
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

  useEffect(() => {
    fetchSavedAttendance();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upload Attendance Screenshot</Text>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Choose Screenshot</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image.uri }} style={styles.preview} />}

      {loading ? (
        <ActivityIndicator size="large" color="#4eb8e6" />
      ) : (
        image && (
          <TouchableOpacity style={styles.button} onPress={uploadAttendance}>
            <Text style={styles.buttonText}>Upload & Save</Text>
          </TouchableOpacity>
        )
      )}

      <Text style={styles.subtitle}>Saved Attendance</Text>
      {savedAttendance.map((a) => (
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
            <Text style={{ fontSize: 12 }}>
              {JSON.stringify(a.attendance_data)}
            </Text>
          ) : (
            <Text>No extracted data</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: "600", marginTop: 20 },
  button: {
    backgroundColor: "#4eb8e6",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  preview: {
    width: 250,
    height: 350,
    marginVertical: 20,
    resizeMode: "contain",
  },
  card: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    alignItems: "center",
  },
  savedImage: { width: 200, height: 280, resizeMode: "contain" },
  timestamp: { fontSize: 12, color: "#555", marginTop: 5 },
});
