// screens/AddAttendance.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getClientId } from "../ClientId";

export default function AddAttendance() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pick screenshot
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  // Upload to backend
  const uploadAttendance = async () => {
    if (!image) return Alert.alert("Error", "Please select a screenshot first");

    try {
      setLoading(true);
      const clientId = await getClientId();

      const res = await fetch("http://<YOUR_BACKEND_URL>/api/upload-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: image.base64,
          clientId,
        }),
      });

      const data = await res.json();
      console.log("Upload response:", data);

      if (res.ok) {
        Alert.alert("Success", "Attendance extracted and saved!");
        setImage(null);
      } else {
        Alert.alert("Error", data.result || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Attendance Screenshot</Text>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Choose Screenshot</Text>
      </TouchableOpacity>

      {image && (
        <Image source={{ uri: image.uri }} style={styles.preview} />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#4eb8e6" />
      ) : (
        image && (
          <TouchableOpacity style={styles.button} onPress={uploadAttendance}>
            <Text style={styles.buttonText}>Upload & Save</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  button: { backgroundColor: "#4eb8e6", padding: 15, borderRadius: 10, marginVertical: 10 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  preview: { width: 250, height: 350, marginVertical: 20, resizeMode: "contain" },
});
