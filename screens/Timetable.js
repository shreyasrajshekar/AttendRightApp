// Timetable.js
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Timetable() {
  const [timetableImage, setTimetableImage] = useState(null);
  const [examStartDate, setExamStartDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Pick timetable screenshot
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setTimetableImage(result.assets[0].uri);
    }
  };

  // Date Picker Handler
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExamStartDate(selectedDate);
    }
  };

  return (
    <LinearGradient
      colors={["#4eb8e6ff", "#87b4c4ff", "#c0e7f8ff"]}
      style={styles.container}
    >
      <Text style={styles.title}>Add Timetable</Text>

      {/* Upload Timetable Screenshot */}
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Upload Timetable Screenshot</Text>
      </TouchableOpacity>

      {timetableImage && (
        <Image source={{ uri: timetableImage }} style={styles.preview} />
      )}

      {/* Exam Start Date */}
      <TouchableOpacity
        style={[styles.button, { marginTop: 30 }]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.buttonText}>
          {examStartDate
            ? `Exam Start: ${examStartDate.toDateString()}`
            : "Select Exam Start Date"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={examStartDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDate}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginVertical: 30,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    color: "#4eb8e6",
    fontWeight: "bold",
  },
  preview: {
    width: 280,
    height: 200,
    resizeMode: "contain",
    borderRadius: 10,
    marginTop: 20,
  },
});
