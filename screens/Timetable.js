// screens/Timetable.js
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

export default function Timetable() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedTimetables, setSavedTimetables] = useState([]);

  // pick timetable screenshot
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  // upload timetable to Supabase
  const uploadTimetable = async () => {
    if (!image) return Alert.alert("Error", "Please select a screenshot first");

    try {
      setLoading(true);
      const clientId = await getClientId();

      // (optional) send to Gemini API for extraction before saving
      // For now we just store the base64 + dummy extracted JSON
      const dummyExtracted = { status: "uploaded", time: new Date().toISOString() };

      const { error } = await supabase.from("timetables").insert([
        {
          user_id: clientId,
          screenshot: image.base64,
          timetable: dummyExtracted,
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Timetable saved!");
      setImage(null);
      fetchSavedTimetables(); // refresh list
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // fetch saved timetables
  const fetchSavedTimetables = async () => {
    const { data, error } = await supabase
      .from("timetables")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSavedTimetables(data);
    }
  };

  useEffect(() => {
    fetchSavedTimetables();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upload Timetable Screenshot</Text>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Choose Screenshot</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image.uri }} style={styles.preview} />}

      {loading ? (
        <ActivityIndicator size="large" color="#4eb8e6" />
      ) : (
        image && (
          <TouchableOpacity style={styles.button} onPress={uploadTimetable}>
            <Text style={styles.buttonText}>Upload & Save</Text>
          </TouchableOpacity>
        )
      )}

      <Text style={styles.subtitle}>Saved Timetables</Text>
      {savedTimetables.map((t) => (
        <View key={t.id} style={styles.card}>
          <Image
            source={{ uri: `data:image/png;base64,${t.screenshot}` }}
            style={styles.savedImage}
          />
          <Text style={styles.timestamp}>
            {new Date(t.created_at).toLocaleString()}
          </Text>
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
