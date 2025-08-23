// screens/AddAttendance.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../supabase";
import { getClientId } from "../ClientId";

export default function AddAttendance() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastAttendance, setLastAttendance] = useState(null);

  // pick screenshot
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  // upload screenshot
  const uploadAttendance = async () => {
    if (!image) return Alert.alert("Error", "Please select a screenshot first");

    try {
      setLoading(true);
      const clientId = await getClientId();

      // dummy extracted info, can be replaced with Gemini output
      const dummyExtracted = { status: "uploaded", time: new Date().toISOString() };

      const { error } = await supabase.from("attendance").insert([
        {
          user_id: clientId,
          screenshot: image.base64,
          extracted_data: dummyExtracted,
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Attendance saved!");
      setImage(null);
      fetchLastAttendance(); // refresh latest
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // fetch latest attendance
  const fetchLastAttendance = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (!error && data.length > 0) {
      setLastAttendance(data[0]);
    }
  };

  useEffect(() => {
    fetchLastAttendance();
  }, []);

  return (
    <View style={styles.container}>
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

      <Text style={styles.subtitle}>Last Updated Attendance</Text>
      {lastAttendance ? (
        <View style={styles.card}>
          <Image
            source={{ uri: `data:image/png;base64,${lastAttendance.screenshot}` }}
            style={styles.savedImage}
          />
          <Text style={styles.timestamp}>
            {new Date(lastAttendance.created_at).toLocaleString()}
          </Text>
        </View>
      ) : (
        <Text style={{ marginTop: 10, color: "#555" }}>
          No attendance uploaded yet.
        </Text>
      )}
    </View>
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
